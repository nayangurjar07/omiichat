import { Router, Request, Response } from 'express';
import multer from 'multer';
import { CloudStorageService } from '../storage/CloudStorageService';
import { moderateImage, hasValidMediaSignature } from '../storage/imageModeration';
import { config } from '../config';
import { logger } from '../utils/logger';

const router = Router();
const storage = new CloudStorageService();

// Cap uploads at 2 MB with multer memory storage for magic-byte validation
const MAX_UPLOAD_LIMIT = 2 * 1024 * 1024; // 2 MB cap

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_UPLOAD_LIMIT,
  },
});

const ALLOWED_IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_AUDIO_MIMES = [
  'audio/webm',
  'audio/ogg',
  'audio/mp4',
  'audio/m4a',
  'audio/wav',
  'audio/x-m4a',
  'audio/aac',
];

/**
 * POST /api/upload
 * Handles images and voice notes capped at 2 MB.
 * Validates magic-byte signatures and routes to Cloud/Supabase storage in production.
 */
router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file provided' });
      return;
    }

    const { buffer, originalname, mimetype, size } = req.file;

    // 1. Identify media kind
    const isImage = ALLOWED_IMAGE_MIMES.includes(mimetype);
    const isAudio = ALLOWED_AUDIO_MIMES.includes(mimetype);

    if (!isImage && !isAudio) {
      res.status(400).json({
        error: `Unsupported file type: ${mimetype}. Only JPEG, PNG, WebP images and audio recordings are accepted.`,
      });
      return;
    }

    // 2. Validate 2 MB size cap
    if (size > MAX_UPLOAD_LIMIT) {
      res.status(400).json({
        error: `File exceeds maximum allowed size of 2 MB (${(size / (1024 * 1024)).toFixed(2)} MB uploaded).`,
      });
      return;
    }

    // 3. Magic-byte signature verification: reject SVG, executables, scripts, or spoofed headers
    if (!hasValidMediaSignature(buffer)) {
      logger.warn(`Upload rejected: invalid media signature for file ${originalname} (${mimetype})`);
      res.status(400).json({
        error: 'Invalid file signature. Executable, SVG, HTML, or disguised files are strictly prohibited.',
      });
      return;
    }

    // 4. For images: execute moderation pipeline
    let moderation = { approved: true, flagged: false, reason: undefined as string | undefined };
    if (isImage) {
      const modResult = await moderateImage(buffer, mimetype, originalname);
      if (!modResult.approved) {
        res.status(422).json({
          error: modResult.reason || 'Image rejected by safety moderation.',
        });
        return;
      }
      moderation = {
        approved: modResult.approved,
        flagged: modResult.flagged,
        reason: modResult.reason,
      };
    }

    // 5. Save through Cloud/Supabase storage provider
    const result = await storage.upload(buffer, originalname, mimetype);
    logger.info(`Uploaded ${isImage ? 'image' : 'voice note'} via ${storage.getActiveProvider()}: ${result.key} (${result.size} bytes)`);

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.json({
      success: true,
      url: result.url,
      key: result.key,
      type: isImage ? 'image' : 'audio',
      mimeType: mimetype,
      size: result.size,
      provider: storage.getActiveProvider(),
      moderation,
    });
  } catch (err) {
    logger.error('Error during media upload:', err);
    res.status(500).json({ error: 'Failed to process media upload' });
  }
});

export { storage };
export default router;
