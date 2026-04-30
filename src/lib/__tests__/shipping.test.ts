import {
  getZoneFromZipCode,
  isTwoDayShippingEligible,
  calculateShipping,
  calculateDeliveryDate,
  formatDeliveryDate,
  getShippingBadgeText,
  SHIPPING_METHODS,
} from '../shipping';

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
    it('should format date as a string', () => {
      const date = new Date('2026-03-25');
      const formatted = formatDeliveryDate(date);
      
      expect(typeof formatted).toBe('string');
      expect(formatted.length).toBeGreaterThan(0);
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
});
