import { verifyToken } from '@clerk/backend';
import type { Request, Response, NextFunction } from 'express';

/**
 * Verifies a Clerk session token supplied as `Authorization: Bearer <token>`.
 *
 * The storefront relies on Clerk's Next.js middleware/`auth()` helper; this
 * standalone API has no Next.js runtime, so it verifies the token directly with
 * `@clerk/backend` and attaches the returned session claims to the request.
 *
 * `CLERK_SECRET_KEY` must be configured for the admin queue routes. When it is
 * absent the route reports 503 (configuration error) rather than 401, mirroring
 * the storefront's "config error maps to 503" treatment of Paystack.
 */
export async function requireClerk(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  const secretKey = process.env.CLERK_SECRET_KEY?.trim();
  if (!secretKey) {
    response
      .status(503)
      .json({ ok: false, error: 'Admin authentication is not configured.' });
    return;
  }

  const header = request.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length).trim() : '';

  if (!token) {
    response.status(401).json({ ok: false, error: 'Unauthorized' });
    return;
  }

  try {
    const sessionClaims = await verifyToken(token, { secretKey });
    (request as Request & { sessionClaims?: unknown }).sessionClaims = sessionClaims;
    next();
  } catch {
    response.status(401).json({ ok: false, error: 'Unauthorized' });
  }
}
