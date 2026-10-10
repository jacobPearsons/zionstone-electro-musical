import type { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger.js';

/**
 * Terminal 404 handler. Runs only after every route has declined the request.
 * Kept JSON-only and envelope-consistent with the rest of the API.
 */
export function notFoundHandler(request: Request, response: Response): void {
  response.status(404).json({ ok: false, error: 'Not found' });
}

/**
 * Central error handler.
 *
 * Registered last with the 4-argument signature Express requires. It logs the
 * full error server-side but never leaks a stack trace or message to the
 * client — the response is a fixed, safe envelope.
 */
export function errorHandler(
  error: unknown,
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  if (response.headersSent) {
    next(error);
    return;
  }

  // Body-parser and similar middleware attach an HTTP status to client errors
  // (e.g. 413 for an oversized body, 400 for malformed JSON). Surface those
  // without leaking the underlying message; everything else is a 500.
  const status = readHttpStatus(error);
  if (status !== undefined && status >= 400 && status < 500) {
    logger.warn('request_rejected', {
      id: request.id,
      method: request.method,
      path: request.path,
      status,
    });
    response.status(status).json({ ok: false, error: 'Bad request' });
    return;
  }

  logger.error('unhandled_error', {
    id: request.id,
    method: request.method,
    path: request.path,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });

  response.status(500).json({ ok: false, error: 'Internal server error' });
}

function readHttpStatus(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null) return undefined;
  const candidate = (error as { status?: unknown; statusCode?: unknown }).status
    ?? (error as { statusCode?: unknown }).statusCode;
  return typeof candidate === 'number' ? candidate : undefined;
}
