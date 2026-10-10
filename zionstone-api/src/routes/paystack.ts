import { Router, type Request } from 'express';
import express from 'express';
import { z } from 'zod';
import {
  PaystackApiError,
  PaystackConfigError,
  computeOrderTotals,
  generateReference,
  initializeTransaction,
  isPaystackConfigured,
  readOrder,
  saveOrder,
  toKobo,
  verifyTransaction,
  type OrderRecord,
} from '../lib/paystack.js';

export const paystackRouter = Router();
paystackRouter.use(express.json());

const UNAVAILABLE = 'Payment temporarily unavailable — try again shortly.';

const initializeSchema = z.object({
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

const verifySchema = z.object({
  reference: z
    .string()
    .min(3)
    .max(120)
    .regex(/^[A-Za-z0-9._-]+$/, 'Invalid reference format.'),
});

/**
 * The storefront ran on the same origin as its API and could fall back to
 * `request.url` for the Paystack redirect. Here the floor is this API's own
 * origin, with the storefront origin preferred when configured so the customer
 * lands back on the shopping site rather than the API.
 */
function siteOrigin(request: Request): string {
  const configured =
    process.env.PUBLIC_SITE_URL?.trim() ||
    process.env.CLIENT_ORIGIN?.split(',')[0]?.trim() ||
    '';
  if (configured) return configured.replace(/\/+$/, '');
  return `${request.protocol}://${request.get('host') ?? 'localhost'}`;
}

paystackRouter.post('/initialize', async (request, response) => {
  const parsed = initializeSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ ok: false, error: 'Invalid checkout request.' });
    return;
  }

  if (!isPaystackConfigured()) {
    response.status(503).json({ ok: false, error: UNAVAILABLE });
    return;
  }

  const { items, shippingMethodId, promoCode, email } = parsed.data;
  const totals = computeOrderTotals(items, shippingMethodId, promoCode);

  if (totals.items.length === 0 || totals.totalNgn <= 0) {
    response.status(400).json({ ok: false, error: 'No purchasable items in this order.' });
    return;
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

    const callbackUrl = new URL('/pay/result', siteOrigin(request)).toString();
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

    response.json({ ok: true, authorizationUrl: result.authorizationUrl, reference });
  } catch (error) {
    if (error instanceof PaystackConfigError) {
      response.status(503).json({ ok: false, error: UNAVAILABLE });
      return;
    }
    if (error instanceof PaystackApiError) {
      response.status(502).json({ ok: false, error: error.message });
      return;
    }
    response.status(500).json({ ok: false, error: 'Could not start payment.' });
  }
});

paystackRouter.post('/verify', async (request, response) => {
  const parsed = verifySchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ ok: false, status: 'invalid', error: 'Invalid reference.' });
    return;
  }

  if (!isPaystackConfigured()) {
    response.status(503).json({ ok: false, status: 'unavailable', error: UNAVAILABLE });
    return;
  }

  const { reference } = parsed.data;

  try {
    const verified = await verifyTransaction(reference);

    if (verified.status !== 'success') {
      response.json({ ok: false, status: verified.status });
      return;
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
    response.json({ ok: true, order });
  } catch (error) {
    if (error instanceof PaystackConfigError) {
      response.status(503).json({ ok: false, status: 'unavailable', error: UNAVAILABLE });
      return;
    }
    if (error instanceof PaystackApiError) {
      response.status(502).json({ ok: false, status: 'error', error: error.message });
      return;
    }
    response.status(500).json({ ok: false, status: 'error' });
  }
});
