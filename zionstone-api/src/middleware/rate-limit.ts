import type { Request, Response, NextFunction } from 'express';

/**
 * In-memory, per-IP rate limiter for public product submissions.
 *
 * Mirrors the storefront route (`src/app/api/queue/products/route.ts`)
 * semantics: a rolling one-hour window, at most 5 submissions per client.
 * State is process-local, which is the same trade-off the storefront made —
 * one instance, no shared store.
 */
const RATE_WINDOW_MS = 60 * 60 * 1000;
const RATE_MAX = 5;

const submissionLog = new Map<string, number[]>();

function clientIp(request: Request): string {
  // `trust proxy` is set to 1 in the app, so Express resolves `request.ip` from
  // the right-most untrusted X-Forwarded-For hop. We deliberately do not parse
  // the header ourselves: trusting the left-most value lets a client spoof its
  // own key and bypass the limit.
  return request.ip ?? request.socket.remoteAddress ?? 'unknown';
}

export function rateLimit(request: Request, response: Response, next: NextFunction): void {
  const ip = clientIp(request);
  const now = Date.now();
  const recent = (submissionLog.get(ip) ?? []).filter((at) => now - at < RATE_WINDOW_MS);

  if (recent.length >= RATE_MAX) {
    submissionLog.set(ip, recent);
    response.status(429).json({
      ok: false,
      error: 'Too many submissions from this connection. Please try again later.',
    });
    return;
  }

  recent.push(now);
  submissionLog.set(ip, recent);
  next();
}
