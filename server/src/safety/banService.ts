/**
 * Ban service — check, create, and auto-enforce session bans.
 * Auto-bans sessions that accumulate 3+ reports within 24 hours.
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { countRecentReports } from './reportService';

const prisma = new PrismaClient();

const AUTO_BAN_THRESHOLD = 3;

/** Check if a session is currently banned */
export async function isBanned(sessionId: string): Promise<boolean> {
  const ban = await prisma.ban.findUnique({
    where: { sessionId },
  });

  if (!ban) return false;

  // If the ban has an expiry and it's passed, remove it
  if (ban.expiresAt && ban.expiresAt < new Date()) {
    await prisma.ban.delete({ where: { id: ban.id } });
    return false;
  }

  return true;
}

/** Ban a session (upsert to handle re-banning) */
export async function banSession(
  sessionId: string,
  reason: string,
  expiresAt?: Date,
): Promise<void> {
  try {
    await prisma.ban.upsert({
      where: { sessionId },
      update: { reason, expiresAt: expiresAt || null },
      create: { sessionId, reason, expiresAt: expiresAt || null },
    });
    logger.info(`Session banned: ${sessionId} (${reason})`);
  } catch (err) {
    logger.error('Failed to ban session', err);
    throw err;
  }
}

/** Remove a ban */
export async function unbanSession(sessionId: string): Promise<void> {
  try {
    await prisma.ban.delete({ where: { sessionId } });
    logger.info(`Session unbanned: ${sessionId}`);
  } catch (err) {
    // If ban doesn't exist, that's fine
    logger.warn(`Unban failed (may not exist): ${sessionId}`);
  }
}

/**
 * Check if a session should be auto-banned.
 * @returns true if a ban was applied
 */
export async function checkAutoBan(sessionId: string): Promise<boolean> {
  const recentCount = await countRecentReports(sessionId, 24);
  if (recentCount >= AUTO_BAN_THRESHOLD) {
    await banSession(sessionId, `Auto-banned: ${recentCount} reports in 24h`);
    return true;
  }
  return false;
}

/** Get all active bans (for admin panel) */
export async function getBans() {
  return prisma.ban.findMany({
    orderBy: { createdAt: 'desc' },
  });
}
