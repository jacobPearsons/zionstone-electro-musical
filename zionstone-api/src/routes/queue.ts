import { Router } from 'express';
import express from 'express';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import {
  ALLOWED_IMAGE_TYPES,
  IMAGE_EXTENSIONS,
  MAX_IMAGE_BYTES,
  isAllowedImageType,
  isQueueStatus,
  listQueue,
  setQueueStatus,
  slugify,
  submissionSchema,
  submitToQueue,
} from '../lib/queue.js';
import { requireClerk } from '../middleware/auth.js';
import { rateLimit } from '../middleware/rate-limit.js';
import { uploadImage, uploadDir } from '../middleware/upload.js';

export const queueRouter = Router();

const UNAVAILABLE_IMAGE_MESSAGE = `Images must be ${ALLOWED_IMAGE_TYPES
  .map((type) => type.split('/')[1])
  .join(', ')}`;

/**
 * Absolute base URL used to build renderable image paths. The storefront stored
 * a relative `/images/...` URL because the API and the pages share an origin;
 * here the storefront is a separate deployment, so the API must hand back a
 * fully-qualified URL that a browser on another origin can load.
 */
function publicApiUrl(): string {
  return (process.env.PUBLIC_API_URL?.trim() || 'http://localhost:4000').replace(/\/+$/, '');
}

/** Mirrors the storefront's `parseTags`: JSON array if parseable, else comma-split. */
function parseTags(value: unknown): unknown {
  if (Array.isArray(value)) value = value[0];
  if (typeof value !== 'string' || !value.trim()) return [];
  try {
    return JSON.parse(value);
  } catch {
    return value
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
}

function optionalField(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

/**
 * Public product submission. Rate-limited per IP, then a single `image` upload,
 * then validation — the same order as the storefront route so oversized or
 * wrong-typed uploads are rejected before the DB write.
 */
queueRouter.post('/products', rateLimit, uploadImage, async (request, response) => {
  const file = request.file;
  if (!file) {
    response.status(400).json({ ok: false, error: 'A product photo is required' });
    return;
  }

  try {
    if (!isAllowedImageType(file.mimetype)) {
      await fs.rm(file.path, { force: true });
      response.status(422).json({ ok: false, error: UNAVAILABLE_IMAGE_MESSAGE });
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      await fs.rm(file.path, { force: true });
      response.status(422).json({ ok: false, error: 'Image must be 10MB or smaller' });
      return;
    }

    const body = (request.body ?? {}) as Record<string, unknown>;
    const parsed = submissionSchema.safeParse({
      name: body.name ?? '',
      brand: optionalField(body.brand),
      category: body.category ?? '',
      tags: parseTags(body.tags),
      description: body.description ?? '',
      price: optionalField(body.price),
      contact: optionalField(body.contact),
    });

    if (!parsed.success) {
      await fs.rm(file.path, { force: true });
      response.status(422).json({
        ok: false,
        error: parsed.error.issues[0]?.message ?? 'Invalid submission',
      });
      return;
    }

    const slug = slugify(parsed.data.name) || 'item';
    const extension = IMAGE_EXTENSIONS[file.mimetype] ?? 'jpg';
    const filename = `${slug}.${extension}`;
    await fs.rename(file.path, path.join(uploadDir(), filename));

    const product = await submitToQueue({
      ...parsed.data,
      imagePath: `${publicApiUrl()}/uploads/${filename}`,
    });

    response.status(201).json({ ok: true, product });
  } catch {
    await fs.rm(file.path, { force: true }).catch(() => undefined);
    response
      .status(500)
      .json({ ok: false, error: 'Could not save your submission. Please try again.' });
  }
});

/** Clerk-protected queue listing, optionally filtered by `?status=`. */
queueRouter.get('/', requireClerk, async (request, response) => {
  const { status } = request.query;
  if (status !== undefined && !isQueueStatus(status)) {
    response
      .status(400)
      .json({ ok: false, error: "status must be 'pending', 'approved' or 'rejected'" });
    return;
  }

  const items = await listQueue(isQueueStatus(status) ? status : undefined).catch(() => null);
  if (items === null) {
    response.status(500).json({ ok: false, error: 'Could not load the queue.' });
    return;
  }
  response.json({ ok: true, items });
});

/** Clerk-protected approve/reject. The item id travels in the path. */
queueRouter.patch('/:id', requireClerk, express.json(), async (request, response) => {
  const { id } = request.params;
  const body = request.body as { action?: unknown } | undefined;
  const action = body?.action;

  if (typeof id !== 'string' || (action !== 'approve' && action !== 'reject')) {
    response
      .status(400)
      .json({ ok: false, error: "Expected { action: 'approve' | 'reject' }" });
    return;
  }

  try {
    const items = await setQueueStatus(id, action === 'approve' ? 'approved' : 'rejected');
    response.json({ ok: true, items });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not update the submission';
    const status = message.startsWith('Invalid queue id') ? 400 : 404;
    response.status(status).json({ ok: false, error: message });
  }
});
