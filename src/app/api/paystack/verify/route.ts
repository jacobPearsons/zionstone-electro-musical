import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  PaystackApiError,
  PaystackConfigError,
  isPaystackConfigured,
  readOrder,
  saveOrder,
  toKobo,
  verifyTransaction,
  type OrderRecord,
} from '@/lib/paystack';

export const runtime = 'nodejs';

const requestSchema = z.object({
  reference: z
    .string()
    .min(3)
    .max(120)
    .regex(/^[A-Za-z0-9._-]+$/, 'Invalid reference format.'),
});

const UNAVAILABLE = 'Payment temporarily unavailable — try again shortly.';

export async function POST(request: Request) {
  const json: unknown = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, status: 'invalid', error: 'Invalid reference.' }, { status: 400 });
  }

  if (!isPaystackConfigured()) {
    return NextResponse.json({ ok: false, status: 'unavailable', error: UNAVAILABLE }, { status: 503 });
  }

  const { reference } = parsed.data;

  try {
    const verified = await verifyTransaction(reference);

    if (verified.status !== 'success') {
      return NextResponse.json({ ok: false, status: verified.status });
    }

    const existing = await readOrder(reference);
    const now = new Date().toISOString();

    const order: OrderRecord = existing
      ? {
          ...existing,
          status: 'paid',
          amountNgn: verified.amountNgn,
          currency: verified.currency,
          paidAt: verified.paidAt,
          channel: verified.channel,
          updatedAt: now,
        }
      : {
          reference: verified.reference,
          email: '',
          items: [],
          shipping: { methodId: '', name: '', priceNgn: 0, free: false },
          totals: {
            subtotalNgn: 0,
            discountNgn: 0,
            shippingNgn: 0,
            totalNgn: verified.amountNgn,
            kobo: toKobo(verified.amountNgn),
          },
          status: 'paid',
          amountNgn: verified.amountNgn,
          currency: verified.currency,
          paidAt: verified.paidAt,
          channel: verified.channel,
          createdAt: now,
          updatedAt: now,
        };

    await saveOrder(order);
    return NextResponse.json({ ok: true, order });
  } catch (error) {
    if (error instanceof PaystackConfigError) {
      return NextResponse.json({ ok: false, status: 'unavailable', error: UNAVAILABLE }, { status: 503 });
    }
    if (error instanceof PaystackApiError) {
      return NextResponse.json({ ok: false, status: 'error', error: error.message }, { status: 502 });
    }
    return NextResponse.json({ ok: false, status: 'error' }, { status: 500 });
  }
}
