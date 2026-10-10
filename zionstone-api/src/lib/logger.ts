/**
 * Minimal structured logger.
 *
 * Render (and most 12-factor hosts) capture stdout/stderr as an event stream,
 * so every line here is a single JSON object. No transport, no files, no
 * external dependency — this is deliberately small.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_WEIGHT: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function resolveThreshold(): number {
  const configured = process.env.LOG_LEVEL?.trim().toLowerCase();
  if (configured && configured in LEVEL_WEIGHT) {
    return LEVEL_WEIGHT[configured as LogLevel];
  }
  return LEVEL_WEIGHT.info;
}

export function log(level: LogLevel, message: string, meta: Record<string, unknown> = {}): void {
  if (LEVEL_WEIGHT[level] < resolveThreshold()) return;

  const line = JSON.stringify({
    level,
    time: new Date().toISOString(),
    msg: message,
    ...meta,
  });

  // Errors go to stderr so hosts can separate them; everything else to stdout.
  if (level === 'error') {
    process.stderr.write(`${line}\n`);
  } else {
    process.stdout.write(`${line}\n`);
  }
}

export const logger = {
  debug: (message: string, meta?: Record<string, unknown>) => log('debug', message, meta),
  info: (message: string, meta?: Record<string, unknown>) => log('info', message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => log('warn', message, meta),
  error: (message: string, meta?: Record<string, unknown>) => log('error', message, meta),
};
