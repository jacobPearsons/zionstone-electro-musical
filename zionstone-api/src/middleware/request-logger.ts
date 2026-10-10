import { randomUUID } from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger.js';

declare module 'express-serve-static-core' {
  interface Request {
    /** Correlation id echoed back in `X-Request-Id`. */
    id?: string;
  }
}

/**
 * One structured log line per completed request: method, path, status and
 * duration, tagged with a request id that is also returned in the response so
 * a client/user can quote it in a support request. The query string is
 * intentionally excluded — it can carry tokens.
 */
export function requestLogger(request: Request, response: Response, next: NextFunction): void {
  const header = request.headers['x-request-id'];
  const id = (Array.isArray(header) ? header[0] : header)?.trim() || randomUUID();
  request.id = id;
  response.setHeader('X-Request-Id', id);

  const start = process.hrtime.bigint();

  response.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
    logger.info('request', {
      id,
      method: request.method,
      path: request.path,
      status: response.statusCode,
      durationMs: Math.round(durationMs * 100) / 100,
    });
  });

  next();
}
