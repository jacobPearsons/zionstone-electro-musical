import { prisma } from '../lib/prisma.js';
import {
  ALLOWED_IMAGE_TYPES,
  isAllowedImageType,
  listQueue,
  setQueueStatus,
  slugify,
  submissionSchema,
  submitToQueue,
} from '../lib/queue.js';

const validSubmission = {
  name: 'Fender Stratocaster',
  category: 'guitars-basses',
  tags: ['electric', 'vintage'],
  description: 'A well-kept instrument with original pickups and a hard case.',
};

describe('slugify', () => {
  it('lowercases, trims, and collapses separators', () => {
    expect(slugify('  Fender  Stratocaster  ')).toBe('fender-stratocaster');
    expect(slugify('Moog / Subsequent-37')).toBe('moog-subsequent-37');
  });

  it('strips leading and trailing separators', () => {
    expect(slugify('---hello---')).toBe('hello');
    expect(slugify('!!!')).toBe('');
  });

  it('folds accents to ascii', () => {
    expect(slugify('Ibanéz')).toBe('ibanez');
  });
});

describe('isAllowedImageType', () => {
  it('accepts the supported image types', () => {
    for (const type of ALLOWED_IMAGE_TYPES) {
      expect(isAllowedImageType(type)).toBe(true);
    }
  });

  it('rejects non-image and unsupported image mime types', () => {
    expect(isAllowedImageType('text/html')).toBe(false);
    expect(isAllowedImageType('application/octet-stream')).toBe(false);
    expect(isAllowedImageType('image/gif')).toBe(false);
    expect(isAllowedImageType('')).toBe(false);
  });
});

describe('submissionSchema', () => {
  it('accepts a valid submission and defaults nothing it should not', () => {
    const result = submissionSchema.safeParse(validSubmission);
    expect(result.success).toBe(true);
  });

  it('coerces a numeric price typed as a string', () => {
    const result = submissionSchema.safeParse({ ...validSubmission, price: '450000' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.price).toBe(450000);
  });

  it('rejects a name that is too short or missing', () => {
    expect(submissionSchema.safeParse({ ...validSubmission, name: 'x' }).success).toBe(false);
    expect(submissionSchema.safeParse({ ...validSubmission, name: undefined }).success).toBe(false);
  });

  it('rejects an empty category', () => {
    expect(submissionSchema.safeParse({ ...validSubmission, category: '  ' }).success).toBe(false);
  });

  it('rejects a description shorter than 20 characters', () => {
    expect(submissionSchema.safeParse({ ...validSubmission, description: 'too short' }).success).toBe(
      false
    );
  });

  it('rejects more than eight tags', () => {
    const tags = Array.from({ length: 9 }, (_, index) => `tag-${index}`);
    expect(submissionSchema.safeParse({ ...validSubmission, tags }).success).toBe(false);
  });

  it('rejects a non-positive price', () => {
    expect(submissionSchema.safeParse({ ...validSubmission, price: 0 }).success).toBe(false);
    expect(submissionSchema.safeParse({ ...validSubmission, price: -100 }).success).toBe(false);
  });
});

describe('database queue', () => {
  beforeEach(async () => {
    await prisma.productSubmission.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  const meta = {
    ...validSubmission,
    brand: 'Fender',
    price: 450000,
    imagePath: '/images/queue/fender-stratocaster/1.jpg',
  };

  it('creates a pending submission and reads it back', async () => {
    const product = await submitToQueue(meta);

    expect(product.status).toBe('pending');
    expect(product.currency).toBe('NGN');
    expect(product.slug).toBe('fender-stratocaster');
    expect(product.name).toBe('Fender Stratocaster');
    expect(product.imagePath).toBe(meta.imagePath);
  });

  it('lists a pending submission via listQueue(status) and listQueue()', async () => {
    const product = await submitToQueue(meta);

    const pending = await listQueue('pending');
    expect(pending.map((item) => item.id)).toEqual([product.id]);

    const all = await listQueue();
    expect(all.map((item) => item.id)).toEqual([product.id]);
  });

  it('lists nothing for an empty queue', async () => {
    await prisma.productSubmission.deleteMany();
    await expect(listQueue('pending')).resolves.toEqual([]);
  });

  it('approves an item and reflects the new status in the returned list', async () => {
    const product = await submitToQueue(meta);

    const items = await setQueueStatus(product.id, 'approved');

    expect(items).toHaveLength(1);
    expect(items[0].status).toBe('approved');
    await expect(listQueue('pending')).resolves.toEqual([]);
    await expect(listQueue('approved')).resolves.toHaveLength(1);
  });

  it('rejects an item and reflects the new status in the returned list', async () => {
    const product = await submitToQueue(meta);

    const items = await setQueueStatus(product.id, 'rejected');

    expect(items).toHaveLength(1);
    expect(items[0].status).toBe('rejected');
    await expect(listQueue('approved')).resolves.toEqual([]);
    await expect(listQueue('rejected')).resolves.toHaveLength(1);
  });

  it('rejects when the id does not exist', async () => {
    await expect(setQueueStatus('nonexistent-id', 'approved')).rejects.toThrow(
      'Queue item not found: nonexistent-id'
    );
  });
});
