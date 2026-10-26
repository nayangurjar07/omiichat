import dotenv from 'dotenv';
dotenv.config();

export const config = {
  siteName: process.env.SITE_NAME || 'Omii',
  fullTitle: process.env.FULL_TITLE || 'Omii: Stranger Chat',
  port: parseInt(process.env.PORT || '3001', 10),
  corsOrigin: process.env.CORS_ORIGIN || '*',
  adminPassword: process.env.ADMIN_PASSWORD || 'admin',
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'omii-super-secret-key-change-in-production',
  maxUploadBytes: 3 * 1024 * 1024, // 3 MB image limit
  maxAudioBytes: 5 * 1024 * 1024, // 5 MB voice note limit (30 seconds)
} as const;

