import { findPromoCode, promoDiscount, PROMO_CODES } from '../promo-codes';

describe('Promo codes', () => {
  describe('findPromoCode', () => {
    it('is case-insensitive and trims surrounding whitespace', () => {
      expect(findPromoCode('save20')?.code).toBe('SAVE20');
      expect(findPromoCode('  Save10  ')?.code).toBe('SAVE10');
    });

    it('returns null for an unknown code rather than throwing', () => {
      expect(findPromoCode('NOPE')).toBeNull();
      expect(findPromoCode('')).toBeNull();
    });
  });

  describe('promoDiscount', () => {
    const save20 = PROMO_CODES.SAVE20;
    const save10 = PROMO_CODES.SAVE10;

    it('applies a rate, not a flat amount', () => {
      expect(promoDiscount(save20, 1000)).toBe(200);
      expect(promoDiscount(save10, 1000)).toBe(100);
    });

    it('scales with the cart rather than charging a fixed sum', () => {
      expect(promoDiscount(save20, 1899)).toBe(379.8);
      expect(promoDiscount(save20, 149)).toBe(29.8);
    });

    it('rounds to whole cents', () => {
      expect(promoDiscount(save10, 1234.56)).toBe(123.46);
    });

    it('never exceeds the subtotal', () => {
      const absurd = { code: 'HUGE', percent: 250, description: 'test' };
      expect(promoDiscount(absurd, 80)).toBe(80);
    });

    it('returns 0 for no code, an empty cart, or a negative subtotal', () => {
      expect(promoDiscount(null, 500)).toBe(0);
      expect(promoDiscount(save20, 0)).toBe(0);
      expect(promoDiscount(save20, -50)).toBe(0);
    });
  });
});
