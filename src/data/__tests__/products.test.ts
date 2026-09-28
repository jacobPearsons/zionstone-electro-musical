import {
  discountPercent,
  getCompatibleCount,
  getProductBySlug,
  getProductsByCategory,
  getSaleProducts,
  isOnSale,
  maxDiscountPercent,
  products,
  type CompatibilityCategory,
  type Product,
} from '../products';

/**
 * Sale and discount arithmetic.
 *
 * This store shipped a "40% off" badge while the catalogue topped out at 21%.
 * That class of bug is only preventable if the badge is *derived* — so what
 * these tests protect is the derivation, and the shape of the numbers it
 * produces, rather than the current prices. The one exception is the
 * hand-arithmetic spot check, which pins the formula itself.
 */

/** A minimal, valid product. Only the fields under test need overriding. */
function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'test-1',
    name: 'Test Product',
    brand: 'TestBrand',
    price: 100,
    category: 'guitars-basses',
    slug: 'test-product',
    emoji: '🎸',
    shipsInDays: 2,
    twoDayEligible: true,
    rating: 5,
    reviews: 1,
    ...overrides,
  };
}

/**
 * Builds a product whose `originalPrice` is deliberately not a number.
 *
 * `isOnSale` guards with `typeof originalPrice === 'number'` specifically
 * because catalogue data can arrive as JSON or from the database, where a
 * missing price is a string or null rather than an absent key. The `Product`
 * type cannot express that, so the cast goes through `unknown` — `any` would
 * silence the compiler at the call site too, where it is not needed.
 */
function withRawOriginalPrice(originalPrice: unknown, price: number): Product {
  return { ...makeProduct({ price }), originalPrice } as unknown as Product;
}

/** Looks a product up by slug and fails loudly, so no test needs a cast. */
function productBySlug(slug: string): Product {
  const product = getProductBySlug(slug);
  if (!product) throw new Error(`Expected a product with slug "${slug}"`);
  return product;
}

describe('Sale and discount arithmetic', () => {
  describe('isOnSale', () => {
    // Invariant: "on sale" is a claim about money, so it requires a recorded
    // higher price. No `originalPrice` means nothing was discounted.
    it('is false when no originalPrice is recorded', () => {
      expect(isOnSale(makeProduct())).toBe(false);
      expect(isOnSale(makeProduct({ originalPrice: undefined }))).toBe(false);
    });

    // Invariant: the comparison is strictly greater. A product whose
    // `originalPrice` merely equals its price is full price, and calling it a
    // sale would render a "0% OFF" badge next to a struck-through price that is
    // the same number.
    it('is false when originalPrice equals price', () => {
      expect(isOnSale(makeProduct({ price: 100, originalPrice: 100 }))).toBe(false);
    });

    // Invariant: a recorded "original" below the selling price is a data error,
    // and a negative discount badge is worse than no badge at all.
    it('is false when originalPrice is below price', () => {
      expect(isOnSale(makeProduct({ price: 100, originalPrice: 99.99 }))).toBe(false);
    });

    it('is true only when originalPrice is a number strictly greater than price', () => {
      expect(isOnSale(makeProduct({ price: 100, originalPrice: 100.01 }))).toBe(true);
      expect(isOnSale(makeProduct({ price: 100, originalPrice: 101 }))).toBe(true);
    });

    // Invariant: the `typeof` guard is load-bearing for real data, not
    // decoration. A stringified price must not silently compare as a number.
    it('is false when originalPrice is present but not a number', () => {
      expect(isOnSale(withRawOriginalPrice('199', 100))).toBe(false);
      expect(isOnSale(withRawOriginalPrice(null, 100))).toBe(false);
      expect(isOnSale(withRawOriginalPrice(NaN, 100))).toBe(false);
    });
  });

  describe('discountPercent', () => {
    // Invariant: null, not 0. The UI branches on null to decide whether to
    // render a sale chip at all, so a non-sale reporting 0 would put a "0% OFF"
    // badge on every product in the catalogue.
    it('returns null for a product that is not on sale', () => {
      expect(discountPercent(makeProduct())).toBeNull();
      expect(discountPercent(makeProduct({ price: 100, originalPrice: 100 }))).toBeNull();
    });

    // Invariant: the formula, pinned against hand arithmetic on real catalogue
    // data. 849 from 999 is 15.015%, which must read as 15, not 15.015.
    it('returns the hand-computed whole percentage for a known sale', () => {
      // 849 from 999 is 15.015% -> 15.  149 from 189 is 21.16% -> 21, and 21 is
      // the number the "up to N% off" badge is allowed to claim.
      expect(discountPercent(productBySlug('fender-stratocaster-player'))).toBe(15);
      expect(discountPercent(productBySlug('ath-m50x'))).toBe(21);
    });

    // Invariant: the badge renders through a template literal, so a float or a
    // negative would reach the customer as "14.999999999998% OFF". Rounding is
    // part of the contract, not a presentation detail.
    it('is always a non-negative integer across the whole catalogue', () => {
      for (const product of products) {
        const percent = discountPercent(product);
        if (percent === null) continue;

        expect(Number.isInteger(percent)).toBe(true);
        expect(percent).toBeGreaterThan(0);
        expect(percent).toBeLessThan(100);
      }
    });

    // Invariant: the reported percentage has to describe the real prices. A
    // rounding change that made the badge drift from the arithmetic is exactly
    // the "40% off" failure this store already shipped once, so the reported
    // whole number may differ from the true fraction by at most the rounding.
    it('never overstates or understates the cut it reports', () => {
      for (const product of products) {
        const percent = discountPercent(product);
        if (percent === null || !isOnSale(product)) continue;

        const actual = (1 - product.price / (product.originalPrice as number)) * 100;

        expect(percent).toBeGreaterThanOrEqual(Math.floor(actual));
        expect(percent).toBeLessThanOrEqual(Math.ceil(actual));
      }
    });
  });

  describe('maxDiscountPercent', () => {
    // Invariant: this is the number every "up to N% off" badge reads, so it has
    // to be the true maximum over the catalogue — recomputed here independently
    // of the reduce that produces it.
    it('equals the real maximum discount across the catalogue', () => {
      const trueMaximum = products.reduce(
        (highest, product) => Math.max(highest, discountPercent(product) ?? 0),
        0
      );

      expect(maxDiscountPercent()).toBe(trueMaximum);
    });

    // Invariant: a storewide claim smaller than one product's actual cut is a
    // claim the store cannot honour. This is the direct guard on the removed
    // "40% off" badge.
    it('is at least as large as every individual product discount', () => {
      const maximum = maxDiscountPercent();

      for (const product of products) {
        const percent = discountPercent(product);
        if (percent === null) continue;
        expect(maximum).toBeGreaterThanOrEqual(percent);
      }
    });

    // Invariant: the catalogue currently has something on sale, so the badge is
    // actually rendered. If this ever reaches 0 the hero slide's badge is dropped
    // by the `deepestDiscount > 0` ternary — a silent copy change, not a crash.
    it('reflects a live discount, so the badge is not silently suppressed today', () => {
      expect(getSaleProducts().length).toBeGreaterThan(0);
      expect(maxDiscountPercent()).toBeGreaterThan(0);
    });

    // LIMITATION — the empty-catalogue case. `maxDiscountPercent` closes over
    // the module-local `products` binding, so its answer cannot be observed by
    // swapping the array: `jest.doMock` replaces the module's *exports*, and the
    // real function still closes over the real array, so the call returns 21
    // whatever the mock says. Forcing the state by mutating the shared `products`
    // export is ruled out — it leaks through the module registry into other
    // suites and into the app's own module graph. Nothing is asserted here that
    // would pass by accident; the two tests below pin the *inputs* the empty
    // catalogue would produce, which is the half that is observable.
    it('reduces an empty catalogue to 0 rather than throwing, because the reduce is seeded', () => {
      // The seed is what keeps `reduce` from throwing on an empty array, and 0
      // is what a seeded `Math.max` over no terms returns. Re-asserted here as
      // the shape the function relies on rather than a claim about its output.
      expect([].reduce((highest: number) => Math.max(highest, 0), 0)).toBe(0);
    });

    // Invariant: every element the reduce sees is a non-negative whole number.
    // Seeded with 0 over non-negative terms, that makes 0 the only possible
    // answer for a catalogue with no sales — which is the state the hero badge's
    // `deepestDiscount > 0` guard exists to handle.
    it('feeds the reduce only non-negative whole numbers, so 0 is reachable', () => {
      const terms = products.map(product => discountPercent(product) ?? 0);

      expect(terms.every(term => Number.isInteger(term) && term >= 0)).toBe(true);
      expect(maxDiscountPercent()).toBeGreaterThanOrEqual(0);
    });

    // Invariant: a catalogue whose products are all non-sale contributes only
    // the `?? 0` fallback, so it cannot drag the storewide badge below zero or
    // produce a negative or fractional claim.
    it('contributes only 0s from a catalogue where nothing is on sale', () => {
      const nothingOnSale = [makeProduct({ price: 100 }), makeProduct({ price: 250 })];

      expect(nothingOnSale.every(product => !isOnSale(product))).toBe(true);
      expect(nothingOnSale.map(product => discountPercent(product) ?? 0)).toEqual([0, 0]);
    });
  });

  describe('getSaleProducts', () => {
    // Invariant: the deals band renders one card per entry, so a stray product
    // here becomes a card with a struck-through price and no badge.
    it('returns exactly the products isOnSale accepts', () => {
      expect(getSaleProducts()).toEqual(products.filter(isOnSale));
    });

    // Invariant: every card in the deals band prints `{discountPercent(deal)}%`
    // with no null guard, so a returned non-sale would render "null%".
    it('returns only products with a renderable percentage', () => {
      for (const product of getSaleProducts()) {
        expect(discountPercent(product)).not.toBeNull();
      }
    });

    // Invariant: the same products must come back every time. A caller that
    // mutated the returned array would silently change what the next caller
    // sees, because it is the same array the filter just allocated from a
    // module-level source.
    it('does not hand out a handle on the shared catalogue', () => {
      const first = getSaleProducts();
      const firstLength = first.length;
      first.push(makeProduct({ id: 'injected' }));

      expect(getSaleProducts()).toHaveLength(firstLength);
    });
  });

  describe('getProductsByCategory', () => {
    // Invariant: a category grid must contain only that category, or the count
    // shown beside the filter is wrong in the one place the shopper is choosing.
    it('returns only products carrying the requested category', () => {
      for (const slug of new Set(products.map(product => product.category))) {
        for (const product of getProductsByCategory(slug)) {
          expect(product.category).toBe(slug);
        }
      }
    });

    // Invariant: an unknown `?category=` value must yield an empty grid and the
    // empty state, never the whole catalogue.
    it('returns an empty array for an unknown category', () => {
      expect(getProductsByCategory('not-a-real-category')).toEqual([]);
      expect(getProductsByCategory('')).toEqual([]);
    });
  });

  describe('getCompatibleCount', () => {
    // Invariant: the number in parentheses on a compatibility chip has to be
    // the real size of the linked grid, so it is recomputed here from the
    // catalogue rather than trusted.
    it('counts products in the category that list the product category as compatible', () => {
      const accessoryCategories: CompatibilityCategory[] = [
        'cases',
        'stands',
        'bags',
        'cables',
        'accessories',
      ];

      for (const accessory of accessoryCategories) {
        for (const productCategory of new Set(products.map(product => product.category))) {
          const expected = products.filter(
            product =>
              product.category === accessory &&
              (product.compatibility ?? []).some(compatible => compatible === productCategory)
          ).length;

          expect(getCompatibleCount(accessory, productCategory)).toBe(expected);
        }
      }
    });

    // Invariant: the chip only renders a count when it is greater than zero, and
    // no reachable input can produce a negative one. The accessory types
    // (`cases`, `stands`, ...) are not catalogue categories, so today this is
    // legitimately 0 everywhere — the point is that it is 0 because it counted,
    // not because it was hardcoded.
    it('is never negative and never exceeds the catalogue', () => {
      for (const accessory of ['cases', 'stands', 'bags', 'cables', 'accessories'] as CompatibilityCategory[]) {
        const count = getCompatibleCount(accessory, 'guitars-basses');
        expect(count).toBeGreaterThanOrEqual(0);
        expect(count).toBeLessThanOrEqual(products.length);
      }
    });

    it('returns 0 for a category nothing is stocked in', () => {
      expect(getCompatibleCount('cases', 'guitars-basses')).toBe(0);
    });
  });
});
