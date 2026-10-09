import { computeOrderTotals, resolveShippingNgn, toKobo } from '@/lib/paystack';
import { FREE_SHIPPING_THRESHOLD, SHIPPING_METHODS, STANDARD_SHIPPING_FALLBACK } from '@/lib/shipping';

const STANDARD = SHIPPING_METHODS[0];
const EXPRESS = SHIPPING_METHODS[1];

const STRAT = '1';
const STRAT_PRICE = 1_273_500;
const STAND = 'n-25';
const STAND_PRICE = 90_000;
const PRICE_ON_REQUEST = 'n-59';

describe('computeOrderTotals', () => {
  it('prices each line from the catalogue, not from the request', () => {
    const totals = computeOrderTotals([{ productId: STRAT, quantity: 2 }], STANDARD.id);

    expect(totals.items).toHaveLength(1);
    expect(totals.items[0].unitPriceNgn).toBe(STRAT_PRICE);
    expect(totals.items[0].quantity).toBe(2);
    expect(totals.items[0].lineTotalNgn).toBe(STRAT_PRICE * 2);
    expect(totals.subtotalNgn).toBe(STRAT_PRICE * 2);
  });

  it('sums multiple line items', () => {
    const totals = computeOrderTotals(
      [
        { productId: STRAT, quantity: 1 },
        { productId: STAND, quantity: 3 },
      ],
      STANDARD.id,
    );

    expect(totals.items).toHaveLength(2);
    expect(totals.subtotalNgn).toBe(STRAT_PRICE + STAND_PRICE * 3);
  });

  it('ignores unknown product ids, unpriced products and non-positive quantities', () => {
    const totals = computeOrderTotals(
      [
        { productId: 'does-not-exist', quantity: 1 },
        { productId: PRICE_ON_REQUEST, quantity: 1 },
        { productId: STAND, quantity: 0 },
        { productId: STAND, quantity: -2 },
      ],
      STANDARD.id,
    );

    expect(totals.items).toEqual([]);
    expect(totals.subtotalNgn).toBe(0);
  });

  it('has no tax term: total is subtotal minus discount plus shipping', () => {
    const totals = computeOrderTotals([{ productId: STAND, quantity: 1 }], STANDARD.id);

    expect(totals.totalNgn).toBe(totals.subtotalNgn - totals.discountNgn + totals.shippingNgn);
  });
});

describe('shipping at the free-shipping threshold', () => {
  it('charges the selected method below the threshold', () => {
    const totals = computeOrderTotals([{ productId: STAND, quantity: 1 }], STANDARD.id);

    expect(totals.subtotalNgn).toBe(STAND_PRICE);
    expect(totals.freeShipping).toBe(false);
    expect(totals.shippingNgn).toBe(STANDARD.price);
    expect(totals.totalNgn).toBe(STAND_PRICE + STANDARD.price);
  });

  it('drops shipping to zero at or above the threshold', () => {
    const totals = computeOrderTotals([{ productId: STAND, quantity: 2 }], STANDARD.id);

    expect(totals.subtotalNgn).toBe(STAND_PRICE * 2);
    expect(totals.subtotalNgn).toBeGreaterThanOrEqual(FREE_SHIPPING_THRESHOLD);
    expect(totals.freeShipping).toBe(true);
    expect(totals.shippingNgn).toBe(0);
    expect(totals.totalNgn).toBe(STAND_PRICE * 2);
  });

  it('uses the chosen method price below the threshold', () => {
    const totals = computeOrderTotals([{ productId: STAND, quantity: 1 }], EXPRESS.id);

    expect(totals.shippingMethodId).toBe(EXPRESS.id);
    expect(totals.shippingNgn).toBe(EXPRESS.price);
    expect(totals.totalNgn).toBe(STAND_PRICE + EXPRESS.price);
  });

  it('falls back to the standard price for an unknown method', () => {
    const totals = computeOrderTotals([{ productId: STAND, quantity: 1 }], 'unknown-method');

    expect(totals.shippingNgn).toBe(STANDARD_SHIPPING_FALLBACK);
  });

  it('is exact at the threshold boundary in resolveShippingNgn', () => {
    expect(resolveShippingNgn(FREE_SHIPPING_THRESHOLD - 1, STANDARD.price)).toBe(STANDARD.price);
    expect(resolveShippingNgn(FREE_SHIPPING_THRESHOLD - 0.01, STANDARD.price)).toBe(STANDARD.price);
    expect(resolveShippingNgn(FREE_SHIPPING_THRESHOLD, STANDARD.price)).toBe(0);
    expect(resolveShippingNgn(FREE_SHIPPING_THRESHOLD + 1, STANDARD.price)).toBe(0);
  });
});

describe('promo codes', () => {
  it('applies a percentage rate to the merchandise subtotal', () => {
    const totals = computeOrderTotals([{ productId: STRAT, quantity: 1 }], STANDARD.id, 'SAVE20');

    expect(totals.promoCode).toBe('SAVE20');
    expect(totals.promoPercent).toBe(20);
    expect(totals.discountNgn).toBe(254_700);
    expect(totals.totalNgn).toBe(1_018_800);
  });

  it('accepts a lower-case code', () => {
    const totals = computeOrderTotals([{ productId: STRAT, quantity: 1 }], STANDARD.id, 'save10');

    expect(totals.promoCode).toBe('SAVE10');
    expect(totals.discountNgn).toBe(127_350);
  });

  it('ignores an unknown code rather than throwing', () => {
    const totals = computeOrderTotals([{ productId: STRAT, quantity: 1 }], STANDARD.id, 'NOPE');

    expect(totals.promoCode).toBeUndefined();
    expect(totals.discountNgn).toBe(0);
  });

  it('never lets the total go negative', () => {
    const totals = computeOrderTotals([{ productId: STAND, quantity: 1 }], STANDARD.id, 'SAVE20');

    expect(totals.totalNgn).toBeGreaterThanOrEqual(0);
  });
});

describe('toKobo', () => {
  it('converts whole naira to kobo', () => {
    expect(toKobo(0)).toBe(0);
    expect(toKobo(98_985)).toBe(9_898_500);
    expect(toKobo(1_273_500)).toBe(127_350_000);
  });

  it('rounds fractional kobo with Math.round', () => {
    expect(toKobo(123.456)).toBe(12_346);
    expect(toKobo(12.5)).toBe(1_250);
    expect(toKobo(1.994)).toBe(199);
    expect(toKobo(0.001)).toBe(0);
  });

  it('matches the kobo field carried on the totals', () => {
    const totals = computeOrderTotals([{ productId: STRAT, quantity: 1 }], STANDARD.id, 'SAVE20');

    expect(totals.totalKobo).toBe(toKobo(totals.totalNgn));
  });
});
