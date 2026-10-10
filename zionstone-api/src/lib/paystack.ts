import { randomBytes } from 'crypto';
import { Prisma, type PaystackOrderStatus as PrismaOrderStatus } from '@prisma/client';
import { products } from '../data/products.js';
import {
  SHIPPING_METHODS,
  STANDARD_SHIPPING_FALLBACK,
  qualifiesForFreeShipping,
} from './shipping.js';
import { findPromoCode, promoDiscount } from './promo-codes.js';
import { prisma } from './prisma.js';

export const PAYSTACK_API_BASE = 'https://api.paystack.co';

/** Raised when `PAYSTACK_SECRET_KEY` is absent; routes translate this to a 503. */
export class PaystackConfigError extends Error {
  constructor(message = 'PAYSTACK_SECRET_KEY is not set') {
    super(message);
    this.name = 'PaystackConfigError';
  }
}

/** Raised when Paystack rejects a request or returns `status: false`. */
export class PaystackApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PaystackApiError';
  }
}

export function isPaystackConfigured(): boolean {
  const key = process.env.PAYSTACK_SECRET_KEY;
  return typeof key === 'string' && key.trim() !== '';
}

export function getPaystackSecretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key || key.trim() === '') {
    throw new PaystackConfigError();
  }
  return key;
}

export function toKobo(amountNgn: number): number {
  return Math.round(amountNgn * 100);
}

export interface OrderLineInput {
  productId: string;
  quantity: number;
}

export interface OrderLineItem {
  productId: string;
  name: string;
  brand: string;
  unitPriceNgn: number;
  quantity: number;
  lineTotalNgn: number;
}

export interface OrderTotals {
  items: OrderLineItem[];
  subtotalNgn: number;
  discountNgn: number;
  shippingNgn: number;
  totalNgn: number;
  totalKobo: number;
  shippingMethodId: string;
  shippingName: string;
  freeShipping: boolean;
  promoCode?: string;
  promoPercent?: number;
}

/**
 * Charges nothing once the merchandise subtotal clears the store-wide free
 * shipping threshold, otherwise the selected method's NGN price. Kept as its
 * own pure function so the exact boundary is directly testable.
 */
export function resolveShippingNgn(merchandiseSubtotalNgn: number, methodPriceNgn: number): number {
  return qualifiesForFreeShipping(merchandiseSubtotalNgn) ? 0 : methodPriceNgn;
}

/**
 * The single source of truth for what a customer is charged. Prices are read
 * from the static catalogue rather than from the client, so a tampered request
 * body can only change *which* real products are bought, never their price.
 */
export function computeOrderTotals(
  lines: OrderLineInput[],
  shippingMethodId: string,
  promoCode?: string,
): OrderTotals {
  const items: OrderLineItem[] = [];

  for (const line of lines) {
    const product = products.find((candidate) => candidate.id === line.productId);
    if (!product || product.price == null) continue;

    const quantity = Math.floor(line.quantity);
    if (!Number.isFinite(quantity) || quantity < 1) continue;

    items.push({
      productId: product.id,
      name: product.name,
      brand: product.brand,
      unitPriceNgn: product.price,
      quantity,
      lineTotalNgn: product.price * quantity,
    });
  }

  const subtotalNgn = items.reduce((sum, item) => sum + item.lineTotalNgn, 0);

  const promo = promoCode ? findPromoCode(promoCode) : null;
  const discountNgn = promoDiscount(promo, subtotalNgn);

  const method = SHIPPING_METHODS.find((candidate) => candidate.id === shippingMethodId);
  const methodPriceNgn = method?.price ?? STANDARD_SHIPPING_FALLBACK;
  const freeShipping = qualifiesForFreeShipping(subtotalNgn);
  const shippingNgn = resolveShippingNgn(subtotalNgn, methodPriceNgn);

  const totalNgn = Math.max(0, subtotalNgn - discountNgn + shippingNgn);

  return {
    items,
    subtotalNgn,
    discountNgn,
    shippingNgn,
    totalNgn,
    totalKobo: toKobo(totalNgn),
    shippingMethodId: method?.id ?? shippingMethodId,
    shippingName: method?.name ?? 'Standard Shipping',
    freeShipping,
    promoCode: promo?.code,
    promoPercent: promo?.percent,
  };
}

export type PaystackOrderStatus = 'pending' | 'paid' | 'failed' | 'abandoned';

export interface OrderRecord {
  reference: string;
  email: string;
  items: OrderLineItem[];
  shipping: {
    methodId: string;
    name: string;
    priceNgn: number;
    free: boolean;
  };
  promo?: {
    code: string;
    percent: number;
    discountNgn: number;
  };
  totals: {
    subtotalNgn: number;
    discountNgn: number;
    shippingNgn: number;
    totalNgn: number;
    kobo: number;
  };
  status: PaystackOrderStatus;
  amountNgn?: number;
  currency?: string;
  paidAt?: string;
  channel?: string;
  createdAt: string;
  updatedAt: string;
}

export function generateReference(): string {
  return `zs-${randomBytes(8).toString('hex')}-${Date.now()}`;
}

const ORDER_STATUS_TO_PRISMA: Record<PaystackOrderStatus, PrismaOrderStatus> = {
  pending: 'PENDING',
  paid: 'PAID',
  failed: 'FAILED',
  abandoned: 'ABANDONED',
};

const PRISMA_STATUS_TO_ORDER: Record<PrismaOrderStatus, PaystackOrderStatus> = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  ABANDONED: 'abandoned',
};

/**
 * Prisma types Json columns as `JsonValue`/`InputJsonValue`, but the order's
 * nested shapes are already plain JSON. These casts move them across that
 * untyped column boundary in one place instead of at every call site.
 */
function asJson<T>(value: unknown): T {
  return value as T;
}

export async function saveOrder(order: OrderRecord): Promise<void> {
  const data = {
    email: order.email,
    items: asJson<Prisma.InputJsonValue>(order.items),
    shipping: asJson<Prisma.InputJsonValue>(order.shipping),
    // An absent promo is a real SQL NULL, not a JSON `null` literal.
    promo: order.promo ? asJson<Prisma.InputJsonValue>(order.promo) : Prisma.DbNull,
    totals: asJson<Prisma.InputJsonValue>(order.totals),
    status: ORDER_STATUS_TO_PRISMA[order.status],
    amountNgn: order.amountNgn ?? null,
    currency: order.currency ?? null,
    paidAt: order.paidAt ? new Date(order.paidAt) : null,
    channel: order.channel ?? null,
  };

  // Upsert keyed on reference so the verify route's read-merge-save keeps the
  // original row (and its createdAt) while flipping it to paid.
  await prisma.order.upsert({
    where: { reference: order.reference },
    create: { reference: order.reference, ...data },
    update: data,
  });
}

export async function readOrder(reference: string): Promise<OrderRecord | null> {
  const row = await prisma.order.findUnique({ where: { reference } });
  if (!row) return null;

  return {
    reference: row.reference,
    email: row.email,
    items: asJson<OrderLineItem[]>(row.items),
    shipping: asJson<OrderRecord['shipping']>(row.shipping),
    ...(row.promo != null
      ? { promo: asJson<NonNullable<OrderRecord['promo']>>(row.promo) }
      : {}),
    totals: asJson<OrderRecord['totals']>(row.totals),
    status: PRISMA_STATUS_TO_ORDER[row.status],
    amountNgn: row.amountNgn ?? undefined,
    currency: row.currency ?? undefined,
    paidAt: row.paidAt ? row.paidAt.toISOString() : undefined,
    channel: row.channel ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

interface PaystackInitializeData {
  authorization_url: string;
  access_code: string;
  reference: string;
}

interface PaystackVerifyData {
  status: string;
  amount: number;
  currency: string;
  reference: string;
  paid_at?: string | null;
  channel?: string | null;
}

interface PaystackResponse<T> {
  status: boolean;
  message: string;
  data?: T;
}

export interface InitializeTransactionInput {
  email: string;
  amountNgn: number;
  reference: string;
  callbackUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface InitializeTransactionResult {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
}

export async function initializeTransaction(
  input: InitializeTransactionInput,
): Promise<InitializeTransactionResult> {
  const secret = getPaystackSecretKey();

  const body: Record<string, unknown> = {
    email: input.email,
    amount: toKobo(input.amountNgn),
    currency: 'NGN',
    reference: input.reference,
  };
  if (input.callbackUrl) body.callback_url = input.callbackUrl;
  if (input.metadata) body.metadata = input.metadata;

  const response = await fetch(`${PAYSTACK_API_BASE}/transaction/initialize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const payload = (await response.json().catch(() => null)) as PaystackResponse<PaystackInitializeData> | null;

  if (!response.ok || !payload?.status || !payload.data?.authorization_url) {
    throw new PaystackApiError(payload?.message || `Paystack initialize failed (HTTP ${response.status})`);
  }

  return {
    authorizationUrl: payload.data.authorization_url,
    accessCode: payload.data.access_code,
    reference: payload.data.reference,
  };
}

export type PaystackTransactionStatus =
  | 'success'
  | 'failed'
  | 'abandoned'
  | 'pending'
  | 'ongoing'
  | 'reversed'
  | 'unknown';

const KNOWN_STATUSES: PaystackTransactionStatus[] = [
  'success',
  'failed',
  'abandoned',
  'pending',
  'ongoing',
  'reversed',
];

export interface VerifyTransactionResult {
  status: PaystackTransactionStatus;
  amountNgn: number;
  currency: string;
  paidAt?: string;
  channel?: string;
  reference: string;
  gatewayMessage: string;
}

export async function verifyTransaction(reference: string): Promise<VerifyTransactionResult> {
  const secret = getPaystackSecretKey();

  const response = await fetch(
    `${PAYSTACK_API_BASE}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      method: 'GET',
      headers: { Authorization: `Bearer ${secret}` },
    },
  );

  const payload = (await response.json().catch(() => null)) as PaystackResponse<PaystackVerifyData> | null;

  if (!response.ok || !payload?.data) {
    throw new PaystackApiError(payload?.message || `Paystack verify failed (HTTP ${response.status})`);
  }

  const status = (KNOWN_STATUSES as string[]).includes(payload.data.status)
    ? (payload.data.status as PaystackTransactionStatus)
    : 'unknown';

  return {
    status,
    amountNgn: payload.data.amount / 100,
    currency: payload.data.currency,
    paidAt: payload.data.paid_at ?? undefined,
    channel: payload.data.channel ?? undefined,
    reference: payload.data.reference ?? reference,
    gatewayMessage: payload.message,
  };
}
