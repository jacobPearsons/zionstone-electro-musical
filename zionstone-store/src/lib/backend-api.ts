import type { ShippingCalculation, ShippingMethod } from '@/types/shipping';

/**
 * Typed client for the Express API (`zionstone-api`) that now owns queueing,
 * checkout and shipping. The storefront is frontend-only: every former Next
 * route handler lives behind this base URL, so pages never hardcode `/api/...`
 * paths or the response envelopes themselves.
 *
 * The base URL is inlined at build time from `NEXT_PUBLIC_API_URL`. It must have
 * a fallback so `next build` still succeeds when the variable is unset (local
 * builds, CI) — reaching the API is a runtime concern, not a build one.
 *
 * Every function is usable from server and client components: it takes a plain
 * argument and never reads request context itself, so a server component passes
 * a Clerk token in explicitly.
 */
export const BASE: string = (
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'
).replace(/\/+$/, '');

export type QueueStatus = 'pending' | 'approved' | 'rejected';
export type QueueAction = 'approve' | 'reject';

export interface ApiQueuedProduct {
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

export interface ApiVerifiedOrder {
  reference: string;
  amountNgn?: number;
  currency?: string;
  paidAt?: string;
  channel?: string;
}

export interface InitializePaymentInput {
  email: string;
  items: { productId: string; quantity: number }[];
  shippingMethodId: string;
  promoCode?: string;
}

export interface ShippingCalculationInput {
  zipCode: string;
  shipsInDays?: number;
}

/**
 * Normalises every non-success response into one throwable shape. `status` is
 * the HTTP code (so callers can special-case 503/429) and `data` is the parsed
 * body (so callers can read `status`/`error` fields the API reports).
 */
export class ApiError extends Error {
  readonly status: number;
  readonly data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }

  /** The API rate-limited this request (submission queue). */
  get isRateLimited(): boolean {
    return this.status === 429;
  }

  /** The API feature is not configured yet (e.g. Paystack keys missing). */
  get isUnavailable(): boolean {
    return this.status === 503;
  }
}

interface ErrorEnvelope {
  ok?: boolean;
  success?: boolean;
  error?: string;
}

async function readBody(response: Response): Promise<unknown> {
  return response.json().catch(() => null);
}

function failed(response: Response, body: unknown): boolean {
  const envelope = body as ErrorEnvelope | null;
  return !response.ok || !envelope || (envelope.ok !== true && envelope.success !== true);
}

function toApiError(response: Response, body: unknown, fallback: string): ApiError {
  const envelope = body as ErrorEnvelope | null;
  const message =
    typeof envelope?.error === 'string' && envelope.error ? envelope.error : fallback;
  return new ApiError(message, response.status, body);
}

async function send(path: string, init: RequestInit, fallback: string): Promise<unknown> {
  const response = await fetch(`${BASE}${path}`, init);
  const body = await readBody(response);

  if (failed(response, body)) {
    throw toApiError(response, body, fallback);
  }

  return body;
}

/** `POST /api/queue/products` — public multipart submission of a product. */
export async function submitProduct(
  formData: FormData
): Promise<{ ok: true; product: ApiQueuedProduct }> {
  const body = (await send(
    '/api/queue/products',
    { method: 'POST', body: formData },
    'Something went wrong. Please try again.'
  )) as { product: ApiQueuedProduct };

  return { ok: true, product: body.product };
}

/** `GET /api/queue?status=...` — Clerk-authenticated review queue. */
export async function listQueue(
  status: QueueStatus,
  token: string | null
): Promise<{ ok: true; items: ApiQueuedProduct[] }> {
  const body = (await send(
    `/api/queue?status=${encodeURIComponent(status)}`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      cache: 'no-store',
    },
    'Could not load the review queue.'
  )) as { items?: ApiQueuedProduct[] };

  return { ok: true, items: body.items ?? [] };
}

/** `PATCH /api/queue/:id` — Clerk-authenticated approve/reject. */
export async function setQueueStatus(
  id: string,
  action: QueueAction,
  token: string | null
): Promise<{ ok: true; items: ApiQueuedProduct[] }> {
  const body = (await send(
    `/api/queue/${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ action }),
    },
    'Could not update the submission'
  )) as { items?: ApiQueuedProduct[] };

  return { ok: true, items: body.items ?? [] };
}

/** `GET /api/shipping/methods` — available delivery methods. */
export async function getShippingMethods(): Promise<{ ok: true; data: ShippingMethod[] }> {
  const body = (await send(
    '/api/shipping/methods',
    {},
    'Could not load shipping methods.'
  )) as { data?: ShippingMethod[] };

  return { ok: true, data: body.data ?? [] };
}

/** `POST /api/shipping/calculate` — zone-based methods and delivery dates. */
export async function calculateShipping(
  payload: ShippingCalculationInput
): Promise<{ ok: true; data: ShippingCalculation }> {
  const body = (await send(
    '/api/shipping/calculate',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ zipCode: payload.zipCode, shipsInDays: payload.shipsInDays ?? 2 }),
    },
    'Could not calculate shipping.'
  )) as { data: ShippingCalculation };

  return { ok: true, data: body.data };
}

/** `POST /api/paystack/initialize` — returns the Paystack redirect URL. */
export async function initializePaystack(
  payload: InitializePaymentInput
): Promise<{ ok: true; authorizationUrl: string; reference: string }> {
  const body = (await send(
    '/api/paystack/initialize',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
    'We could not start payment. Please try again.'
  )) as { authorizationUrl: string; reference: string };

  return { ok: true, authorizationUrl: body.authorizationUrl, reference: body.reference };
}

/**
 * `POST /api/paystack/verify` — confirms a transaction and returns the order.
 *
 * The API answers HTTP 200 with `ok:false` for a *soft* failure (e.g. an
 * abandoned transaction), which `send` turns into a throw so callers keep one
 * conflict path. `data.status` carries that reason for `/pay/result`.
 */
export async function verifyPaystack(
  reference: string
): Promise<{ ok: true; status?: string; order?: ApiVerifiedOrder }> {
  const body = (await send(
    '/api/paystack/verify',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference }),
    },
    'We could not confirm this payment. If you were charged, please contact support.'
  )) as { status?: string; order?: ApiVerifiedOrder };

  return { ok: true, status: body.status, order: body.order };
}
