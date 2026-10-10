import { z } from 'zod';

/**
 * Shared, dependency-free contract for the sell form.
 *
 * This used to live in `src/lib/queue.ts`, which imported Prisma and `fs`; the
 * client component could not import it without dragging Node builtins into the
 * browser bundle, so the form kept its own copy. Queueing now lives behind the
 * Express API, and this module holds the pieces the form genuinely needs: the
 * schema the resolver validates against, plus the image limits used for
 * client-side feedback. The API re-validates every submission server-side, so
 * this is a mirror, not the source of truth.
 */
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_TAGS = 8;

const tagSchema = z.string().trim().min(1).max(40);

export const submissionSchema = z.object({
  name: z.string().trim().min(2, 'Product name must be at least 2 characters'),
  brand: z.string().trim().max(80).optional().or(z.literal('')),
  category: z.string().trim().min(1, 'Please choose a category'),
  tags: z.array(tagSchema).max(MAX_TAGS, 'Add at most 8 tags'),
  description: z.string().trim().min(20, 'Description must be at least 20 characters'),
  price: z.preprocess(
    (value) => (value === '' || value === null ? undefined : value),
    z.coerce.number().positive('Price must be greater than zero').optional()
  ),
  contact: z.string().trim().max(120).optional().or(z.literal('')),
});

export type SubmissionValues = z.infer<typeof submissionSchema>;
