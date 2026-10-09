import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';
import {
  ALLOWED_IMAGE_TYPES,
  isAllowedImageType,
  listQueue,
  setQueueStatus,
  slugify,
  submissionSchema,
  submitToQueue,
} from '../queue';

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

describe('filesystem queue', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await fs.mkdtemp(path.join(os.tmpdir(), 'zionstone-queue-'));
  });

  afterEach(async () => {
    await fs.rm(dir, { recursive: true, force: true });
  });

  const meta = {
    ...validSubmission,
    brand: 'Fender',
    price: 450000,
    imagePath: '/images/queue/fender-stratocaster/1.jpg',
  };

  it('writes a pending JSON file and reads it back', async () => {
    const product = await submitToQueue(meta, dir);

    expect(product.status).toBe('pending');
    expect(product.currency).toBe('NGN');
    expect(product.slug).toBe('fender-stratocaster');

    const files = await fs.readdir(path.join(dir, 'pending'));
    expect(files).toHaveLength(1);
    expect(files[0]).toBe(`${product.id}.json`);

    const parsed = JSON.parse(await fs.readFile(path.join(dir, 'pending', files[0]), 'utf8'));
    expect(parsed.name).toBe('Fender Stratocaster');
    expect(parsed.imagePath).toBe(meta.imagePath);

    const listed = await listQueue('pending', dir);
    expect(listed.map((item) => item.id)).toEqual([product.id]);
  });

  it('lists nothing for an empty queue', async () => {
    await expect(listQueue('pending', dir)).resolves.toEqual([]);
  });

  it('moves an item to approved and updates its status', async () => {
    const product = await submitToQueue(meta, dir);

    const items = await setQueueStatus(product.id, 'approved', dir);

    expect(items).toHaveLength(1);
    expect(items[0].status).toBe('approved');
    await expect(fs.readdir(path.join(dir, 'pending'))).resolves.toEqual([]);
    await expect(fs.readdir(path.join(dir, 'approved'))).resolves.toHaveLength(1);
  });

  it('refuses an id that could escape the queue directory', async () => {
    await expect(setQueueStatus('../evil', 'approved', dir)).rejects.toThrow('Invalid queue id');
  });
});
