import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import {
  ALLOWED_IMAGE_TYPES,
  IMAGE_EXTENSIONS,
  MAX_IMAGE_BYTES,
  isAllowedImageType,
  slugify,
  submissionSchema,
  submitToQueue,
} from '@/lib/queue';

export const runtime = 'nodejs';

const RATE_WINDOW_MS = 60 * 60 * 1000;
const RATE_MAX = 5;
const submissionLog = new Map<string, number[]>();

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]!.trim();
  return request.headers.get('x-real-ip') ?? 'unknown';
}

function withinRateLimit(ip: string): boolean {
  const now = Date.now();
  const recent = (submissionLog.get(ip) ?? []).filter((at) => now - at < RATE_WINDOW_MS);
  if (recent.length >= RATE_MAX) {
    submissionLog.set(ip, recent);
    return false;
  }
  recent.push(now);
  submissionLog.set(ip, recent);
  return true;
}

function parseTags(value: FormDataEntryValue | null): unknown {
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

function optionalField(value: FormDataEntryValue | null): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

export async function POST(request: NextRequest) {
  if (!withinRateLimit(clientIp(request))) {
    return NextResponse.json(
      { ok: false, error: 'Too many submissions from this connection. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const form = await request.formData();

    const image = form.get('image');
    if (!image || typeof image === 'string') {
      return NextResponse.json({ ok: false, error: 'A product photo is required' }, { status: 400 });
    }

    if (!isAllowedImageType(image.type)) {
      return NextResponse.json(
        { ok: false, error: `Images must be ${ALLOWED_IMAGE_TYPES.map((t) => t.split('/')[1]).join(', ')}` },
        { status: 422 }
      );
    }

    if (image.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ ok: false, error: 'Image must be 10MB or smaller' }, { status: 422 });
    }

    const parsed = submissionSchema.safeParse({
      name: form.get('name') ?? '',
      brand: optionalField(form.get('brand')),
      category: form.get('category') ?? '',
      tags: parseTags(form.get('tags')),
      description: form.get('description') ?? '',
      price: optionalField(form.get('price')),
      contact: optionalField(form.get('contact')),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid submission' },
        { status: 422 }
      );
    }

    const slug = slugify(parsed.data.name) || 'item';
    const extension = IMAGE_EXTENSIONS[image.type] ?? 'jpg';
    const imageDir = path.join(process.cwd(), 'public', 'images', 'queue', slug);
    await fs.mkdir(imageDir, { recursive: true });
    const bytes = Buffer.from(await image.arrayBuffer());
    await fs.writeFile(path.join(imageDir, `1.${extension}`), bytes);
    const imagePath = `/images/queue/${slug}/1.${extension}`;

    const product = await submitToQueue({ ...parsed.data, imagePath });

    return NextResponse.json({ ok: true, id: product.id }, { status: 201 });
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Could not save your submission. Please try again.' },
      { status: 500 }
    );
  }
}
