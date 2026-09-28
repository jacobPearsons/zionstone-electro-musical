/**
 * Promo codes, as a pure module so the arithmetic can be tested without a DOM.
 *
 * The codes are **rates**, not flat amounts: the original implementation
 * subtracted a hardcoded `20` / `10` dollars from a $1,899 instrument, which
 * read as an amount rather than a discount and made the saving trivial on
 * cheap gear and invisible on expensive gear. `percent` keeps the promise
 * proportional to what is actually in the cart.
 *
 * This is a client-side lookup, not a promo backend: a real deployment has to
 * re-validate the code server-side before charging.
 */

export interface PromoCode {
  /** Canonical, upper-case form of the code. */
  code: string;
  /** Percentage off the merchandise subtotal, 1–100. */
  percent: number;
  description: string;
}

export const PROMO_CODES: Readonly<Record<string, PromoCode>> = {
  SAVE20: { code: 'SAVE20', percent: 20, description: '20% off your order' },
  SAVE10: { code: 'SAVE10', percent: 10, description: '10% off your order' },
};

export function findPromoCode(input: string): PromoCode | null {
  return PROMO_CODES[input.trim().toUpperCase()] ?? null;
}

function roundCents(amount: number): number {
  return Math.round(amount * 100) / 100;
}

/**
 * The discount for `promo` against the real `subtotal`, rounded to cents and
 * clamped to `[0, subtotal]` so no code — present, future, or mistyped — can
 * drive a line total, or a grand total, below zero.
 */
export function promoDiscount(promo: PromoCode | null, subtotal: number): number {
  if (!promo || !Number.isFinite(subtotal) || subtotal <= 0) return 0;
  const percent = Math.min(100, Math.max(0, promo.percent));
  return roundCents(Math.min(subtotal, (subtotal * percent) / 100));
}
