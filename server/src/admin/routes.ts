/**
 * Admin REST API routes.
 * Protected by a constant-time password check and IP rate limiting.
 * The frontend admin page sends the password in x-admin-password header.
 */

import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { config } from '../config';
import { getReports, updateReportStatus } from '../safety/reportService';
import { banSession, unbanSession, getBans } from '../safety/banService';
import { logger } from '../utils/logger';

const router = Router();

// In-memory rate limiting for failed admin authentications: IP -> { failedAttempts, lockedUntil }
const failedAttemptsMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const record = failedAttemptsMap.get(ip);
  if (!record) return false;
  const now = Date.now();
  if (now > record.resetAt) {
    failedAttemptsMap.delete(ip);
    return false;
  }
  return record.count >= 8;
}

function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  const record = failedAttemptsMap.get(ip);
  if (!record || now > record.resetAt) {
    failedAttemptsMap.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
  } else {
    record.count++;
  }
}

function recordSuccessfulAttempt(ip: string): void {
  failedAttemptsMap.delete(ip);
}

function timingSafeCompare(provided: string, expected: string): boolean {
  if (!provided || !expected) return false;
  const hashProvided = crypto.createHash('sha256').update(provided).digest();
  const hashExpected = crypto.createHash('sha256').update(expected).digest();
  return crypto.timingSafeEqual(hashProvided, hashExpected);
}

/** Admin password protection middleware */
function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const clientIp = req.ip || (req.socket?.remoteAddress) || '127.0.0.1';

  if (isRateLimited(clientIp)) {
    logger.warn(`Admin rate limit hit for IP: ${clientIp}`);
    res.status(429).json({ error: 'Too many failed login attempts. Please wait 15 minutes.' });
    return;
  }

  const password = (req.headers['x-admin-password'] as string) || '';

  const configuredPassword = (
    process.env.ADMIN_PASSWORD ||
    config.adminPassword ||
    ''
  ).trim();

  // If running in production and no secure admin password is set, block access
  const isProd = process.env.NODE_ENV === 'production';
  const expectedPassword = configuredPassword || (isProd ? '' : 'admin');

  if (!expectedPassword || !password || !timingSafeCompare(password.trim(), expectedPassword)) {
    recordFailedAttempt(clientIp);
    res.status(401).json({ error: 'Unauthorized: invalid password' });
    return;
  }

  recordSuccessfulAttempt(clientIp);
  next();
}

router.use(requireAdmin);

// ─── Reports ─────────────────────────────────────────────────────────

/** GET /api/admin/reports — List all reports */
router.get('/reports', async (_req: Request, res: Response) => {
  try {
    const reports = await getReports();
    res.json({ reports });
  } catch (err) {
    logger.error('Failed to fetch reports in admin API:', err);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

/** POST /api/admin/reports/:id/dismiss — Dismiss a report */
router.post('/reports/:id/dismiss', async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await updateReportStatus(id, 'dismissed');
    res.json({ success: true });
  } catch (err) {
    logger.error('Failed to dismiss report in admin API:', err);
    res.status(500).json({ error: 'Failed to dismiss report' });
  }
});

// ─── Bans ────────────────────────────────────────────────────────────

/** POST /api/admin/ban — Ban a session */
router.post('/ban', async (req: Request, res: Response) => {
  try {
    const { sessionId, reason, reportId } = req.body;
    if (!sessionId || !reason) {
      res.status(400).json({ error: 'sessionId and reason are required' });
      return;
    }
    await banSession(sessionId, reason);
    if (reportId) {
      await updateReportStatus(reportId, 'banned');
    }
    res.json({ success: true });
  } catch (err) {
    logger.error('Failed to ban session in admin API:', err);
    res.status(500).json({ error: 'Failed to ban session' });
  }
});

/** POST /api/admin/unban — Unban a session */
router.post('/unban', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      res.status(400).json({ error: 'sessionId is required' });
      return;
    }
    await unbanSession(sessionId);
    res.json({ success: true });
  } catch (err) {
    logger.error('Failed to unban session in admin API:', err);
    res.status(500).json({ error: 'Failed to unban session' });
  }
});

/** GET /api/admin/bans — List all active bans */
router.get('/bans', async (_req: Request, res: Response) => {
  try {
    const bans = await getBans();
    res.json({ bans });
  } catch (err) {
    logger.error('Failed to fetch bans in admin API:', err);
    res.status(500).json({ error: 'Failed to fetch bans' });
  }
});

export default router;
