import multer from 'multer';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import type { Request, Response, NextFunction } from 'express';
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES, isAllowedImageType } from '../lib/queue.js';

/** Absolute path of the upload directory, resolved from `UPLOAD_DIR` (default `uploads`). */
export function uploadDir(): string {
  return path.resolve(process.cwd(), process.env.UPLOAD_DIR?.trim() || 'uploads');
}

mkdirSync(uploadDir(), { recursive: true });

const ALLOWED_MESSAGE = `Images must be ${ALLOWED_IMAGE_TYPES.map((t) => t.split('/')[1]).join(', ')}`;

const storage = multer.diskStorage({
  destination: (_request, _file, callback) => callback(null, uploadDir()),
  // Write to a unique temp name; the route renames to `${slug}.${ext}` once the
  // name field has been parsed, so the final name does not depend on the order
  // of multipart parts.
  filename: (_request, _file, callback) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    callback(null, `${unique}.tmp`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_IMAGE_BYTES },
  fileFilter: (_request, file, callback) => {
    if (!isAllowedImageType(file.mimetype)) {
      callback(new Error(ALLOWED_MESSAGE));
      return;
    }
    callback(null, true);
  },
});

/**
 * Accepts a single `image` field, enforcing the storefront's 10MB limit and
 * mime allowlist. Transport errors are translated to the same status codes and
 * messages the storefront route returned (413/422 for size, 422 for type).
 */
export function uploadImage(request: Request, response: Response, next: NextFunction): void {
  upload.single('image')(request, response, (error: unknown) => {
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        response.status(422).json({ ok: false, error: 'Image must be 10MB or smaller' });
        return;
      }
      response.status(400).json({ ok: false, error: error.message });
      return;
    }
    if (error) {
      response
        .status(422)
        .json({ ok: false, error: error instanceof Error ? error.message : ALLOWED_MESSAGE });
      return;
    }
    next();
  });
}
