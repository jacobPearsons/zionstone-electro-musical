import { z } from 'zod';
import { prisma } from './prisma.js';
import type { ProductSubmission, SubmissionStatus } from '@prisma/client';

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

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export const IMAGE_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const QUEUE_STATUSES: QueueStatus[] = ['pending', 'approved', 'rejected'];

const STATUS_TO_ENUM: Record<QueueStatus, SubmissionStatus> = {
  pending: 'PENDING',
  approved: 'APPROVED',
  rejected: 'REJECTED',
};

const ENUM_TO_STATUS: Record<SubmissionStatus, QueueStatus> = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

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

function mapRow(row: ProductSubmission): QueuedProduct {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    ...(row.brand ? { brand: row.brand } : {}),
    category: row.category,
    tags: row.tags,
    description: row.description,
    ...(row.price != null ? { price: row.price } : {}),
    currency: row.currency as 'NGN',
    ...(row.contact ? { contact: row.contact } : {}),
    imagePath: row.imagePath,
    status: ENUM_TO_STATUS[row.status],
    submittedAt: row.submittedAt.toISOString(),
  };
}

export async function submitToQueue(meta: QueueMeta): Promise<QueuedProduct> {
  const slug = slugify(meta.name) || 'item';
  const brand = meta.brand?.trim() || undefined;
  const contact = meta.contact?.trim() || undefined;

  const row = await prisma.productSubmission.create({
    data: {
      slug,
      name: meta.name.trim(),
      ...(brand ? { brand } : {}),
      category: meta.category,
      tags: meta.tags,
      description: meta.description.trim(),
      ...(meta.price != null ? { price: meta.price } : {}),
      currency: 'NGN',
      ...(contact ? { contact } : {}),
      imagePath: meta.imagePath,
      status: 'PENDING',
    },
  });

  return mapRow(row);
}

export async function listQueue(status?: QueueStatus): Promise<QueuedProduct[]> {
  const rows = await prisma.productSubmission.findMany({
    where: status ? { status: STATUS_TO_ENUM[status] } : undefined,
    orderBy: { submittedAt: 'desc' },
  });

  return rows.map(mapRow);
}

export async function setQueueStatus(
  id: string,
  status: QueueStatus,
): Promise<QueuedProduct[]> {
  const updated = await prisma.productSubmission.updateMany({
    where: { id },
    data: { status: STATUS_TO_ENUM[status] },
  });

  if (updated.count === 0) {
    throw new Error(`Queue item not found: ${id}`);
  }

  return listQueue();
}

export function approveSubmission(id: string) {
  return setQueueStatus(id, 'approved');
}

export function rejectSubmission(id: string) {
  return setQueueStatus(id, 'rejected');
}

export function isQueueStatus(value: unknown): value is QueueStatus {
  return typeof value === 'string' && (QUEUE_STATUSES as string[]).includes(value);
}