import { Router, Request, Response } from 'express';
import multer from 'multer';
import { CloudStorageService } from '../storage/CloudStorageService';
import { moderateImage } from '../storage/imageModeration';
import { config } from '../config';
import { logger } from '../utils/logger';

const router = Router();
const storage = new CloudStorageService();

// Multer memory storage so we can validate buffer and magic bytes before writing
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: Math.max(config.maxUploadBytes, config.maxAudioBytes),
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
 * Handles both images (max 3MB, jpg/png/webp) and voice notes (max 30s/5MB).
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

    // 2. Validate file size limits
    if (isImage && size > config.maxUploadBytes) {
      res.status(400).json({
        error: `Image exceeds maximum allowed size of 3 MB (${(size / (1024 * 1024)).toFixed(2)} MB uploaded).`,
      });
      return;
    }

    if (isAudio && size > config.maxAudioBytes) {
      res.status(400).json({
        error: `Audio note exceeds maximum size limit of 5 MB.`,
      });
      return;
    }

    // 3. For images: execute moderation pipeline
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

    // 4. Save through storage provider
    const result = await storage.upload(buffer, originalname, mimetype);
    logger.info(`Uploaded ${isImage ? 'image' : 'voice note'}: ${result.key} (${result.size} bytes)`);

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.json({
      success: true,
      url: result.url,
      key: result.key,
      type: isImage ? 'image' : 'audio',
      mimeType: mimetype,
      size: result.size,
      moderation,
    });
  } catch (err) {
    logger.error('Error during media upload:', err);
    res.status(500).json({ error: 'Failed to process media upload' });
  }
});

export { storage };
export default router;
