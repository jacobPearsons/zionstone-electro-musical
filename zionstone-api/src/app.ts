import express, { type Express, type Request, type Response } from 'express';
import cors, { type CorsOptions } from 'cors';
import helmet from 'helmet';
import { queueRouter } from './routes/queue.js';
import { paystackRouter } from './routes/paystack.js';
import { shippingRouter } from './routes/shipping.js';
import { uploadDir } from './middleware/upload.js';
import { requestLogger } from './middleware/request-logger.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';
import { prisma } from './lib/prisma.js';

/** Request bodies are JSON/form-encoded and small; cap them explicitly. */
const BODY_LIMIT = '100kb';

/**
 * CORS origin policy.
 *
 * - `CLIENT_ORIGIN` (comma-separated) is the allow-list.
 * - With no allow-list in production we deny browser origins rather than
 *   reflecting any origin — an accidental missing config must fail closed.
 * - With no allow-list outside production we reflect, so the storefront dev
 *   server and curl smoke tests keep working.
 * Requests without an `Origin` header (server-to-server, curl) are not CORS
 * requests and are always allowed through.
 */
function buildCorsOptions(): CorsOptions {
  const allowedOrigins = (process.env.CLIENT_ORIGIN ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    credentials: true,
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }
      if (allowedOrigins.length > 0) {
        callback(null, allowedOrigins.includes(origin));
        return;
      }
      callback(null, !isProduction);
    },
  };
}

/**
 * Builds the Express application. Exported separately from the listener so it
 * can be constructed in tests without binding a port.
 */
export function createApp(): Express {
  const app = express();
  app.disable('x-powered-by');
  // Render terminates TLS and proxies to us in a single hop, so trust exactly
  // one proxy layer for correct protocol/host/client-IP resolution.
  app.set('trust proxy', 1);

  // Security headers. `crossOriginResourcePolicy: cross-origin` is required so
  // the storefront (a different origin) can display uploaded product photos.
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  app.use(requestLogger);
  app.use(cors(buildCorsOptions()));
  app.use(express.json({ limit: BODY_LIMIT }));
  app.use(express.urlencoded({ extended: false, limit: BODY_LIMIT }));

  // Liveness: must NOT touch the database so Render health checks pass even
  // during a Neon blip.
  app.get('/api/health', (_request, response) => {
    response.json({ ok: true });
  });

  // Readiness: does ping the database. Point a separate uptime monitor here;
  // it is deliberately not the Render health check path.
  app.get('/api/ready', async (_request: Request, response: Response) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      response.json({ ok: true });
    } catch {
      response.status(503).json({ ok: false });
    }
  });

  // Product photos captured by the public submission form / upload middleware.
  app.use('/uploads', express.static(uploadDir()));

  app.use('/api/queue', queueRouter);
  app.use('/api/paystack', paystackRouter);
  app.use('/api/shipping', shippingRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
