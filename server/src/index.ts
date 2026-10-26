import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import { Server } from 'socket.io';
import { config } from './config';
import { logger } from './utils/logger';
import { MemoryQueue } from './matching/MemoryQueue';
import { setupSocketHandlers } from './socket/handler';
import adminRoutes from './admin/routes';
import uploadRoutes, { storage } from './upload/routes';
import authRoutes from './auth/routes';

async function bootstrap() {
  const app = express();
  const server = http.createServer(app);

  // Security & Parsing Middleware
  // Disable CSP header in helmet to let Next.js hydrate and display blob media without script blocking
  app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  // Configure matched CORS origins for Express and Socket.IO
  const rawCorsOrigin = process.env.CORS_ORIGIN || config.corsOrigin || '*';
  let corsOriginSetting: boolean | string | string[] | ((origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void);

  if (!rawCorsOrigin || rawCorsOrigin === '*' || rawCorsOrigin === 'true') {
    corsOriginSetting = (origin, callback) => {
      if (!origin) return callback(null, true);
      const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
      if (isLocal || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(new Error('Blocked by CORS policy'));
    };
  } else if (rawCorsOrigin.includes(',')) {
    corsOriginSetting = rawCorsOrigin.split(',').map((o) => o.trim()).filter(Boolean);
  } else {
    corsOriginSetting = rawCorsOrigin.trim();
  }

  app.use(
    cors({
      origin: corsOriginSetting,
      credentials: true,
    })
  );
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Basic health check
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: config.siteName,
      timestamp: new Date().toISOString(),
    });
  });

  // Media Static Storage Directory with CORS & Security Headers
  const uploadDir = storage.getUploadDir();
  app.use(
    '/uploads',
    (req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; sandbox");
      next();
    },
    express.static(uploadDir)
  );

  // REST APIs
  app.use('/api', uploadRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/admin', adminRoutes);

  // Socket.IO Setup
  const io = new Server(server, {
    cors: {
      origin: corsOriginSetting,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 30000,
    pingInterval: 10000,
    maxHttpBufferSize: 1e7, // 10MB
  });

  // Matching Queue & Sockets
  const queue = new MemoryQueue();
  setupSocketHandlers(io, queue);

  // Serve built static web application if public/ exists
  const publicDir = path.resolve(__dirname, '../public');
  if (fs.existsSync(publicDir)) {
    app.use(express.static(publicDir));
    app.get('*', (req, res) => {
      const cleanPath = req.path.replace(/^\//, '').replace(/\/$/, '');
      const directHtml = path.join(publicDir, `${cleanPath}.html`);
      const nestedHtml = path.join(publicDir, cleanPath, 'index.html');
      const fallbackHtml = path.join(publicDir, 'index.html');

      if (cleanPath && fs.existsSync(directHtml)) {
        return res.sendFile(directHtml);
      }
      if (cleanPath && fs.existsSync(nestedHtml)) {
        return res.sendFile(nestedHtml);
      }
      return res.sendFile(fallbackHtml);
    });
    logger.info('Static web application mounted from public directory.');
  }

  const port = process.env.PORT || config.port;
  server.listen(Number(port), '0.0.0.0', () => {
    logger.info(`${config.siteName} Server running on port ${port} (0.0.0.0)`);
  });
}

bootstrap().catch((err) => {
  logger.error('Fatal startup error:', err);
});
