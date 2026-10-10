/**
 * Environment validation.
 *
 * 12-factor: configuration comes from the environment (never code), and the
 * process should fail fast on missing *required* config rather than discovering
 * it on the first request. Optional integrations (Clerk, Paystack) are allowed
 * to be absent because their routes already degrade to a 503 — we only warn.
 */

/** Variables without which the process cannot serve a single request. */
const REQUIRED = ['DATABASE_URL'] as const;

interface OptionalCheck {
  key: string;
  /** What breaks (gracefully) when the variable is absent. */
  effect: string;
  /** Only warn about this one when running in production. */
  productionOnly?: boolean;
}

const OPTIONAL: readonly OptionalCheck[] = [
  { key: 'CLERK_SECRET_KEY', effect: 'admin queue routes will return 503' },
  { key: 'PAYSTACK_SECRET_KEY', effect: 'checkout routes will return 503' },
  {
    key: 'CLIENT_ORIGIN',
    effect: 'browser requests from the storefront will be denied by CORS',
    productionOnly: true,
  },
  {
    key: 'PUBLIC_API_URL',
    effect: 'uploaded image URLs will fall back to localhost',
    productionOnly: true,
  },
];

/** Throws when a required variable is missing or blank. Call once at startup. */
export function assertRequiredEnv(): void {
  const missing = REQUIRED.filter((key) => !process.env[key]?.trim());
  if (missing.length > 0) {
    throw new Error(`Missing required environment variable(s): ${missing.join(', ')}`);
  }
}

/** Human-readable warnings for absent optional integrations. Never throws. */
export function collectEnvWarnings(): string[] {
  const isProduction = process.env.NODE_ENV === 'production';
  const warnings: string[] = [];

  for (const { key, effect, productionOnly } of OPTIONAL) {
    if (productionOnly && !isProduction) continue;
    if (!process.env[key]?.trim()) {
      warnings.push(`${key} is not set — ${effect}.`);
    }
  }

  return warnings;
}
