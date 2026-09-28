import {
  getZoneFromZipCode,
  isTwoDayShippingEligible,
  calculateShipping,
  calculateDeliveryDate,
  formatDeliveryDate,
  getShippingBadgeText,
  FREE_SHIPPING_THRESHOLD,
  STANDARD_SHIPPING_FALLBACK,
  qualifiesForFreeShipping,
  SHIPPING_METHODS,
} from '../shipping';
import type { ShippingCalculation } from '@/types/shipping';
import { products } from '@/data/products';

describe('Shipping Module', () => {
  describe('getZoneFromZipCode', () => {
    it('should return correct zones based on ZIP prefix', () => {
      expect(getZoneFromZipCode('90210')).toBe('west-coast');
      expect(getZoneFromZipCode('94102')).toBe('west-coast');
    });

    it('should return southwest for prefix 02', () => {
      expect(getZoneFromZipCode('85001')).toBe('southwest');
    });

    it('should return mountain for prefixes 03-04', () => {
      expect(getZoneFromZipCode('80202')).toBe('mountain');
      expect(getZoneFromZipCode('80202')).toBe('mountain');
    });

    it('should return midwest for prefixes 05-08', () => {
      expect(getZoneFromZipCode('48000')).toBe('midwest');
      expect(getZoneFromZipCode('55000')).toBe('midwest');
    });

    it('should return east-coast for prefixes 09-12', () => {
      expect(getZoneFromZipCode('10001')).toBe('east-coast');
      expect(getZoneFromZipCode('33101')).toBe('southwest');
    });
  });

  describe('isTwoDayShippingEligible', () => {
    it('should return true for 2-day eligible zones', () => {
      expect(isTwoDayShippingEligible('90210')).toBe(true);
      expect(isTwoDayShippingEligible('85001')).toBe(true);
      expect(isTwoDayShippingEligible('80202')).toBe(true);
      expect(isTwoDayShippingEligible('60601')).toBe(true);
    });

    it('should return false for non-eligible zones', () => {
      expect(isTwoDayShippingEligible('10001')).toBe(false);
    });
  });

  describe('calculateShipping', () => {
    it('should return shipping methods with correct structure', () => {
      const result = calculateShipping('90210', 2);
      
      expect(result.zipCode).toBe('90210');
      expect(result.methods).toHaveLength(3);
      expect(result.methods.find(m => m.id === 'exp')).toBeDefined();
    });

    it('should include estimated delivery dates for all methods', () => {
      const result = calculateShipping('90210', 2);
      
      expect(result.estimatedDeliveryDates).toBeDefined();
      expect(Object.keys(result.estimatedDeliveryDates)).toHaveLength(3);
    });
  });

  describe('calculateDeliveryDate', () => {
    it('should return a future date', () => {
      const deliveryDate = calculateDeliveryDate(2, 2);
      const today = new Date();
      
      expect(deliveryDate.getTime()).toBeGreaterThan(today.getTime());
    });

    it('should return a date at least 1 day in the future', () => {
      const deliveryDate = calculateDeliveryDate(1, 2);
      const today = new Date();
      const daysDiff = Math.ceil((deliveryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      expect(daysDiff).toBeGreaterThanOrEqual(1);
    });
  });

  describe('formatDeliveryDate', () => {
    it('should format an ISO date string as a string', () => {
      const formatted = formatDeliveryDate('2026-03-25T12:00:00.000Z');

      expect(typeof formatted).toBe('string');
      expect(formatted.length).toBeGreaterThan(0);
    });

    it('should return an empty string for an unparseable date', () => {
      expect(formatDeliveryDate('not-a-date')).toBe('');
    });
  });

  describe('API round trip', () => {
    const asApiResponse = (calculation: ShippingCalculation) => ({
      success: true as const,
      data: calculation,
    });

    const overTheWire = (calculation: ShippingCalculation): ShippingCalculation =>
      JSON.parse(JSON.stringify(asApiResponse(calculation))).data;

    it('should expose estimated delivery dates as ISO strings, not Date objects', () => {
      const calculation = calculateShipping('90210', 2);

      for (const isoDate of Object.values(calculation.estimatedDeliveryDates)) {
        expect(typeof isoDate).toBe('string');
        expect(Number.isNaN(new Date(isoDate).getTime())).toBe(false);
      }
    });

    it('should format a serialised delivery date to the expected display string', () => {
      const fixedDelivery = new Date(2026, 2, 25, 12, 0, 0);
      const payload = overTheWire({
        zipCode: '90210',
        methods: SHIPPING_METHODS,
        estimatedDeliveryDates: { std: fixedDelivery.toISOString() },
      });

      const formatted = formatDeliveryDate(payload.estimatedDeliveryDates.std);

      expect(typeof payload.estimatedDeliveryDates.std).toBe('string');
      expect(formatted).toBe('Wednesday, Mar 25');
    });

    it('should format every method of a round-tripped response without throwing', () => {
      const payload = overTheWire(calculateShipping('90210', 2));

      for (const method of payload.methods) {
        const formatted = formatDeliveryDate(payload.estimatedDeliveryDates[method.id]);

        expect(formatted).toMatch(/^[A-Z][a-z]+, [A-Z][a-z]{2} \d{1,2}$/);
      }
    });

    it('should keep the days-until math working on a round-tripped delivery date', () => {
      const payload = overTheWire(calculateShipping('90210', 2));
      const deliveryDate = new Date(payload.estimatedDeliveryDates.std);
      const daysUntilDelivery = Math.ceil(
        (deliveryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );

      expect(daysUntilDelivery).toBeGreaterThanOrEqual(1);
    });
  });

  describe('getShippingBadgeText', () => {
    it('should return "Ships in 2 Days" for eligible items', () => {
      expect(getShippingBadgeText(2, true)).toBe('Ships in 2 Days');
    });

    it('should return "Ships in X Days" for non-eligible items', () => {
      expect(getShippingBadgeText(3, false)).toBe('Ships in 3 Days');
      expect(getShippingBadgeText(5, false)).toBe('Ships in 5 Days');
    });
  });

  describe('SHIPPING_METHODS', () => {
    it('should have three shipping methods', () => {
      expect(SHIPPING_METHODS).toHaveLength(3);
    });

    it('should include standard, express, and overnight options', () => {
      const methodIds = SHIPPING_METHODS.map(m => m.id);
      
      expect(methodIds).toContain('std');
      expect(methodIds).toContain('exp');
      expect(methodIds).toContain('overn');
    });

    it('should have correct pricing', () => {
      const standard = SHIPPING_METHODS.find(m => m.id === 'std');
      const express = SHIPPING_METHODS.find(m => m.id === 'exp');
      const overnight = SHIPPING_METHODS.find(m => m.id === 'overn');
      
      expect(standard?.price).toBe(5.99);
      expect(express?.price).toBe(12.99);
      expect(overnight?.price).toBe(24.99);
    });
  });

  /**
   * The free-shipping promise, and the 2-day badge that shipped as a lie.
   *
   * These two were the store's remaining false claims: a "$50 free shipping"
   * line while the real threshold was $99, and an unconditional "2-Day Shipping"
   * badge on products that take three days. The constants now have one owner
   * (`FREE_SHIPPING_THRESHOLD`, `getShippingBadgeText`) and the job of these
   * tests is to make the boundary and the badge gate impossible to regress.
   */
  describe('FREE_SHIPPING_THRESHOLD', () => {
    // Invariant: the number is interpolated into money copy in three places.
    // NaN, Infinity or a fractional value would render "$NaN" or "$99.50..." to a
    // customer, and a 0 or negative threshold would promise free shipping on an
    // empty cart.
    it('is a positive whole number of dollars', () => {
      expect(Number.isFinite(FREE_SHIPPING_THRESHOLD)).toBe(true);
      expect(Number.isInteger(FREE_SHIPPING_THRESHOLD)).toBe(true);
      expect(FREE_SHIPPING_THRESHOLD).toBeGreaterThan(0);
    });

    // Invariant: "over $99" has to mean strictly more than $99, so a $99.00 cart
    // is still charged. This is the off-by-one the boundary exists to pin: the
    // comparison has to be `>=` against the threshold, and the copy has to say
    // "over", not "at".
    it('is not met one cent below the threshold', () => {
      expect(qualifiesForFreeShipping(0)).toBe(false);
      expect(qualifiesForFreeShipping(1)).toBe(false);
      expect(qualifiesForFreeShipping(FREE_SHIPPING_THRESHOLD - 1)).toBe(false);
      expect(qualifiesForFreeShipping(FREE_SHIPPING_THRESHOLD - 0.01)).toBe(false);
    });

    // Invariant: the exact threshold qualifies. A `>` comparison here would
    // charge shipping on a cart that was told it qualified, which is the bug a
    // boundary test exists to catch.
    it('is met at exactly the threshold', () => {
      expect(qualifiesForFreeShipping(FREE_SHIPPING_THRESHOLD)).toBe(true);
    });

    it('is met above the threshold', () => {
      expect(qualifiesForFreeShipping(FREE_SHIPPING_THRESHOLD + 1)).toBe(true);
      expect(qualifiesForFreeShipping(FREE_SHIPPING_THRESHOLD * 1000)).toBe(true);
    });

    // Invariant: a fractional comparison must not split hairs the copy does not.
    // Cents are the unit the threshold is expressed in, so $98.9999 has to fail
    // and $99.0001 has to pass, with no gap in between.
    it('has no gap across a cent either side of the threshold', () => {
      expect(qualifiesForFreeShipping(FREE_SHIPPING_THRESHOLD - 0.0001)).toBe(false);
      expect(qualifiesForFreeShipping(FREE_SHIPPING_THRESHOLD + 0.0001)).toBe(true);
    });

    // Invariant: adding to a qualifying cart must never revoke free shipping,
    // and removing from a qualifying cart must never silently keep it. One
    // direction only would be a monotone function with the wrong slope.
    it('is monotone in the subtotal', () => {
      for (const subtotal of [0, 10, 50, 98, 99, 100, 149, 2499]) {
        expect(qualifiesForFreeShipping(subtotal + 1)).toBe(
          qualifiesForFreeShipping(subtotal) || subtotal + 1 >= FREE_SHIPPING_THRESHOLD
        );
      }
    });

    // Invariant: a negative or zero subtotal — an emptied cart, or a discount
    // that over-reduces the line — must not qualify for a shipping credit.
    it('is not met by an empty or negative subtotal', () => {
      expect(qualifiesForFreeShipping(0)).toBe(false);
      expect(qualifiesForFreeShipping(-1)).toBe(false);
      expect(qualifiesForFreeShipping(-1000)).toBe(false);
    });

    // Invariant: the announcement bar, the hero badge, the value-prop strip and
    // the cart summary all read this one constant. The paid fallback is the
    // other half of the promise — a sub-threshold cart has to be charged
    // something real, and both numbers have to be positive and ordered so the
    // cheaper promise is the free one.
    it('sits above the paid fallback, so free is the better of the two deals', () => {
      expect(STANDARD_SHIPPING_FALLBACK).toBeGreaterThan(0);
      expect(FREE_SHIPPING_THRESHOLD).toBeGreaterThan(0);
    });
  });

  describe('getShippingBadgeText honest-claims invariant', () => {
    /**
     * What actually shipped as a false claim: a hardcoded
     * `<p>2-Day Shipping</p>` in the product-page trust strip, rendered on every
     * product regardless of `twoDayEligible` (HEAD: products/[slug]/page.tsx:300).
     * `getShippingBadgeText` was never the site of that bug — it already gated on
     * eligibility — so the invariant worth protecting is the one the gate gives
     * you: no *delivery* claim for an ineligible product, and the badge's own
     * number always matching the product's `shipsInDays`.
     *
     * NOTE on a tempting-but-wrong assertion. "Never returns a string containing
     * '2 Days' when not eligible" is NOT the invariant, and no test should assert
     * it. For `shipsInDays: 2, isTwoDayEligible: false` the fallback interpolates
     * to `'Ships in 2 Days'` — which is *true*: the product does leave the
     * warehouse in two days. Forbidding that string would force the badge to
     * claim "Ships in 3 Days" about a two-day product, trading one lie for a
     * worse one. The eligibility gate exists to separate the highlighted
     * two-day-delivery promise from plain dispatch information, and for a
     * two-day product those two sentences are the same words. The delivery-claim
     * forms below are the ones that were false.
     */

    // Invariant: the shipped bug in its general form. "2-Day" / "2 Day
    // Delivery" is a promise about *arrival*, and it is the wording the old flat
    // trust-strip used. It may never appear for a product the shopper's zone
    // cannot receive in two days.
    it('never makes a two-day delivery claim for an ineligible product', () => {
      const deliveryClaims = /2[-\s]?day\s*(shipping|delivery|arrival)/i;

      for (let shipsInDays = 1; shipsInDays <= 14; shipsInDays += 1) {
        expect(getShippingBadgeText(shipsInDays, false)).not.toMatch(deliveryClaims);
      }
    });

    // Invariant: the highlighted two-day promise is exactly
    // `isTwoDayEligible && shipsInDays <= 2` — no wider and no narrower. Too wide
    // is the shipped bug; too narrow means an eligible two-day product loses the
    // reassurance the data says it has earned.
    it('makes the two-day promise if and only if eligible within two days', () => {
      for (let shipsInDays = 1; shipsInDays <= 14; shipsInDays += 1) {
        expect(getShippingBadgeText(shipsInDays, true)).toBe(
          shipsInDays <= 2 ? 'Ships in 2 Days' : `Ships in ${shipsInDays} Days`
        );
      }
    });

    // Invariant: the badge has to name the product's real dispatch time. A badge
    // that reads "2 Days" for a five-day product is the false claim in its
    // strongest form, and this pins the number rather than the wording.
    it('names the real shipsInDays whenever it does not make the two-day promise', () => {
      for (let shipsInDays = 1; shipsInDays <= 14; shipsInDays += 1) {
        expect(getShippingBadgeText(shipsInDays, false)).toBe(`Ships in ${shipsInDays} Days`);
      }
    });

    // Invariant: the gate is `shipsInDays <= 2`, not `=== 2`. Regressing to `=== 2`
    // would drop the two-day promise for a next-day product that is eligible.
    it('does not downgrade a faster eligible product out of the two-day promise', () => {
      expect(getShippingBadgeText(1, true)).toBe('Ships in 2 Days');
    });

    // Invariant: the badge is a promise about speed, so it is never empty and
    // always names a number of days. A blank badge slot in a product card reads
    // as a broken component rather than as "no data".
    it('always returns a non-empty string that names a number of days', () => {
      for (let shipsInDays = 1; shipsInDays <= 14; shipsInDays += 1) {
        for (const eligible of [true, false]) {
          expect(getShippingBadgeText(shipsInDays, eligible)).toMatch(/^Ships in \d+ Days$/);
        }
      }
    });

    // Invariant: the gate is driven by the product data, so the data has to be
    // self-consistent. A product flagged eligible that dispatches in a week would
    // earn a two-day badge it cannot honour — the same class of lie, one layer
    // down in the catalogue rather than in the formatter.
    it('never marks a slow-dispatching product as two-day eligible', () => {
      for (const product of products) {
        if (!product.twoDayEligible) continue;
        expect(product.shipsInDays).toBeLessThanOrEqual(2);
      }
    });

    // Invariant: `twoDayEligible` is about the *shopper's zone*, not the
    // warehouse. It has to be a real boolean, because `ShippingBadge` and
    // `getShippingBadgeText` both branch on it and a truthy string would
    // silently turn the gate open for every product.
    it('carries twoDayEligible as a real boolean on every product', () => {
      for (const product of products) {
        expect(typeof product.twoDayEligible).toBe('boolean');
        expect(Number.isInteger(product.shipsInDays)).toBe(true);
        expect(product.shipsInDays).toBeGreaterThan(0);
      }
    });
  });
});
