import dotenv from 'dotenv';

// Load `.env` first, then resolve the database URL before any module touches
// Prisma. Render injects the connection string as DATABASE_URL; some setups only
// expose the pooled variant, so fall back to it when the direct URL is absent.
// This has to run before `./app.js` is evaluated (hence the dynamic imports),
// because importing the app constructs the Prisma client.
dotenv.config();

if (!process.env.DATABASE_URL && process.env.DATABASE_URL_POOLED) {
  process.env.DATABASE_URL = process.env.DATABASE_URL_POOLED;
}

const { logger } = await import('./lib/logger.js');
const { assertRequiredEnv, collectEnvWarnings } = await import('./lib/env.js');

// Fail fast on missing required config — before constructing Prisma, so the
// error is a clean log line rather than a Prisma initialization crash.
try {
  assertRequiredEnv();
} catch (error) {
  logger.error('startup:invalid_config', {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
}

for (const warning of collectEnvWarnings()) {
  logger.warn('startup:warning', { warning });
}

const { prisma } = await import('./lib/prisma.js');
const { createApp } = await import('./app.js');

const port = Number(process.env.PORT) || 4000;
const app = createApp();

const server = app.listen(port, () => {
  logger.info('startup:listening', { port });
});

let shuttingDown = false;

/**
 * Graceful shutdown. Render sends SIGTERM on every deploy: stop accepting new
 * connections, let in-flight requests finish, close the Prisma pool, exit 0.
 * A short deadline keeps us well inside Render's grace period before SIGKILL.
 */
async function shutdown(signal: NodeJS.Signals): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info('shutdown:start', { signal });

  const forceExit = setTimeout(() => {
    logger.warn('shutdown:timeout', { timeoutMs: 10_000 });
    process.exit(1);
  }, 10_000);
  forceExit.unref();

  server.close(async () => {
    try {
      await prisma.$disconnect();
    } catch (error) {
      logger.error('shutdown:prisma_disconnect_failed', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
    clearTimeout(forceExit);
    logger.info('shutdown:complete');
    process.exit(0);
  });
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
