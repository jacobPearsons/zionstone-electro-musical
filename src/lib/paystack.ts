import { promises as fs } from 'fs';
import { randomBytes } from 'crypto';
import path from 'path';
import { products } from '@/data/products';
import {
  SHIPPING_METHODS,
  STANDARD_SHIPPING_FALLBACK,
  qualifiesForFreeShipping,
} from '@/lib/shipping';
import { findPromoCode, promoDiscount } from '@/lib/promo-codes';

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

const ORDERS_DIR = path.join(process.cwd(), 'queue', 'orders');

export function orderPath(reference: string): string {
  return path.join(ORDERS_DIR, `${path.basename(reference)}.json`);
}

export function generateReference(): string {
  return `zs-${randomBytes(8).toString('hex')}-${Date.now()}`;
}

export async function saveOrder(order: OrderRecord): Promise<void> {
  await fs.mkdir(ORDERS_DIR, { recursive: true });
  await fs.writeFile(orderPath(order.reference), JSON.stringify(order, null, 2), 'utf8');
}

export async function readOrder(reference: string): Promise<OrderRecord | null> {
  try {
    const raw = await fs.readFile(orderPath(reference), 'utf8');
    return JSON.parse(raw) as OrderRecord;
  } catch {
    return null;
  }
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
