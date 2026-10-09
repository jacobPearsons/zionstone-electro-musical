import { promises as fs } from 'fs';
import path from 'path';
import { z } from 'zod';

export type QueueStatus = 'pending' | 'approved' | 'rejected';

export interface QueuedProduct {
  id: string;
  slug: string;
  name: string;
  brand?: string;
  category: string;
  tags: string[];
  description: string;
  price?: number;
  currency: 'NGN';
  contact?: string;
  imagePath: string;
  status: QueueStatus;
  submittedAt: string;
}

export type QueueSubmission = z.infer<typeof submissionSchema>;
export type QueueMeta = QueueSubmission & { imagePath: string };

export const QUEUE_ROOT = path.join(process.cwd(), 'queue');

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export const IMAGE_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const STATUS_DIRS: Record<QueueStatus, string> = {
  pending: 'pending',
  approved: 'approved',
  rejected: 'rejected',
};

const QUEUE_STATUSES: QueueStatus[] = ['pending', 'approved', 'rejected'];

/** Slugs a product name into a stable folder/id segment. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function isAllowedImageType(type: string): boolean {
  return (ALLOWED_IMAGE_TYPES as readonly string[]).includes(type);
}

const tagSchema = z.string().trim().min(1).max(40);

export const submissionSchema = z.object({
  name: z.string().trim().min(2, 'Product name must be at least 2 characters'),
  brand: z.string().trim().max(80).optional().or(z.literal('')),
  category: z.string().trim().min(1, 'Please choose a category'),
  tags: z.array(tagSchema).max(8, 'Add at most 8 tags'),
  description: z.string().trim().min(20, 'Description must be at least 20 characters'),
  price: z.preprocess(
    (value) => (value === '' || value === null ? undefined : value),
    z.coerce.number().positive('Price must be greater than zero').optional()
  ),
  contact: z.string().trim().max(120).optional().or(z.literal('')),
});

function statusDir(root: string, status: QueueStatus): string {
  return path.join(root, STATUS_DIRS[status]);
}

// A queue id becomes a filename, so anything outside this alphabet (slashes,
// dots, null bytes) is a traversal attempt and is refused rather than sanitised.
function assertSafeId(id: string): void {
  if (!/^[a-z0-9-]+$/i.test(id)) {
    throw new Error('Invalid queue id');
  }
}

function normaliseMeta(meta: QueueMeta) {
  return {
    brand: meta.brand?.trim() ? meta.brand.trim() : undefined,
    contact: meta.contact?.trim() ? meta.contact.trim() : undefined,
    tags: meta.tags,
  };
}

export async function submitToQueue(
  meta: QueueMeta,
  root: string = QUEUE_ROOT
): Promise<QueuedProduct> {
  const slug = slugify(meta.name) || 'item';
  const dir = statusDir(root, 'pending');
  await fs.mkdir(dir, { recursive: true });

  const submittedAt = new Date().toISOString();
  const id = `${slug}-${Date.now()}`;
  const { brand, contact, tags } = normaliseMeta(meta);

  const product: QueuedProduct = {
    id,
    slug,
    name: meta.name.trim(),
    ...(brand ? { brand } : {}),
    category: meta.category,
    tags,
    description: meta.description.trim(),
    ...(meta.price != null ? { price: meta.price } : {}),
    currency: 'NGN',
    ...(contact ? { contact } : {}),
    imagePath: meta.imagePath,
    status: 'pending',
    submittedAt,
  };

  await fs.writeFile(
    path.join(dir, `${id}.json`),
    JSON.stringify(product, null, 2),
    'utf8'
  );

  return product;
}

export async function listQueue(
  status?: QueueStatus,
  root: string = QUEUE_ROOT
): Promise<QueuedProduct[]> {
  const statuses = status ? [status] : QUEUE_STATUSES;
  const items: QueuedProduct[] = [];

  for (const current of statuses) {
    const dir = statusDir(root, current);
    let entries: string[];
    try {
      entries = await fs.readdir(dir);
    } catch {
      continue;
    }

    for (const entry of entries) {
      if (!entry.endsWith('.json')) continue;
      try {
        const raw = await fs.readFile(path.join(dir, entry), 'utf8');
        items.push(JSON.parse(raw) as QueuedProduct);
      } catch {
        continue;
      }
    }
  }

  return items.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
}

export async function setQueueStatus(
  id: string,
  status: QueueStatus,
  root: string = QUEUE_ROOT
): Promise<QueuedProduct[]> {
  assertSafeId(id);

  for (const current of QUEUE_STATUSES) {
    const from = path.join(statusDir(root, current), `${id}.json`);
    let raw: string;
    try {
      raw = await fs.readFile(from, 'utf8');
    } catch {
      continue;
    }

    const product = JSON.parse(raw) as QueuedProduct;
    const updated: QueuedProduct = { ...product, status };
    const targetDir = statusDir(root, status);
    await fs.mkdir(targetDir, { recursive: true });
    await fs.writeFile(path.join(targetDir, `${id}.json`), JSON.stringify(updated, null, 2), 'utf8');
    if (targetDir !== path.dirname(from)) {
      await fs.rm(from, { force: true });
    }

    return listQueue(undefined, root);
  }

  throw new Error(`Queue item not found: ${id}`);
}

export function approveSubmission(id: string, root: string = QUEUE_ROOT) {
  return setQueueStatus(id, 'approved', root);
}

export function rejectSubmission(id: string, root: string = QUEUE_ROOT) {
  return setQueueStatus(id, 'rejected', root);
}

export function isQueueStatus(value: unknown): value is QueueStatus {
  return typeof value === 'string' && (QUEUE_STATUSES as string[]).includes(value);
}
