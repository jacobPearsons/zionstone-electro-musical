import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  PaystackApiError,
  PaystackConfigError,
  computeOrderTotals,
  generateReference,
  initializeTransaction,
  isPaystackConfigured,
  saveOrder,
  type OrderRecord,
} from '@/lib/paystack';

export const runtime = 'nodejs';

const requestSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
  shippingMethodId: z.string().min(1),
  promoCode: z.string().min(1).optional(),
  email: z.string().email(),
});

const UNAVAILABLE = 'Payment temporarily unavailable — try again shortly.';

export async function POST(request: Request) {
  const json: unknown = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Invalid checkout request.' }, { status: 400 });
  }

  if (!isPaystackConfigured()) {
    return NextResponse.json({ ok: false, error: UNAVAILABLE }, { status: 503 });
  }

  const { items, shippingMethodId, promoCode, email } = parsed.data;
  const totals = computeOrderTotals(items, shippingMethodId, promoCode);

  if (totals.items.length === 0 || totals.totalNgn <= 0) {
    return NextResponse.json({ ok: false, error: 'No purchasable items in this order.' }, { status: 400 });
  }

  const reference = generateReference();
  const now = new Date().toISOString();

  const order: OrderRecord = {
    reference,
    email,
    items: totals.items,
    shipping: {
      methodId: totals.shippingMethodId,
      name: totals.shippingName,
      priceNgn: totals.shippingNgn,
      free: totals.freeShipping,
    },
    ...(totals.promoCode && totals.promoPercent != null
      ? {
          promo: {
            code: totals.promoCode,
            percent: totals.promoPercent,
            discountNgn: totals.discountNgn,
          },
        }
      : {}),
    totals: {
      subtotalNgn: totals.subtotalNgn,
      discountNgn: totals.discountNgn,
      shippingNgn: totals.shippingNgn,
      totalNgn: totals.totalNgn,
      kobo: totals.totalKobo,
    },
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  };

  try {
    await saveOrder(order);

    // Prefer the canonical public origin when configured. Behind a proxy or a
    // hosted frontend, `request.url` can carry an internal host, so Paystack
    // would redirect the customer somewhere unreachable. Trim a trailing slash
    // so the joined path stays `/pay/result`; fall back to the inbound origin.
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, '');
    const callbackUrl = new URL('/pay/result', siteUrl || request.url).toString();
    const result = await initializeTransaction({
      email,
      amountNgn: totals.totalNgn,
      reference,
      callbackUrl,
      metadata: {
        orderId: reference,
        custom_fields: [
          {
            display_name: 'Order Reference',
            variable_name: 'order_reference',
            value: reference,
          },
        ],
      },
    });

    return NextResponse.json({ ok: true, authorizationUrl: result.authorizationUrl, reference });
  } catch (error) {
    if (error instanceof PaystackConfigError) {
      return NextResponse.json({ ok: false, error: UNAVAILABLE }, { status: 503 });
    }
    if (error instanceof PaystackApiError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 502 });
    }
    return NextResponse.json({ ok: false, error: 'Could not start payment.' }, { status: 500 });
  }
}
