import {
  BRANDS,
  CATEGORIES,
  CATEGORY_SLUGS,
  brandsInCategory,
  categoryDisplayName,
  categoryHref,
} from '../categories';
import { getProductsByCategory, products } from '../products';

/**
 * `categories.ts` exists to replace five hand-maintained taxonomies with one
 * derived from `products.ts` at module load. Its whole value is that it cannot
 * drift: a count can never disagree with the catalogue, and a slug can never
 * ship without backing products. Every test below is a different way of trying
 * to make it drift, and each one must fail if it does.
 */

/** The distinct `product.category` values — the taxonomy the store actually owes. */
const catalogueSlugs = [...new Set(products.map(product => product.category))].sort();

/** The `CATEGORIES` slugs, sorted so comparisons do not depend on display order. */
const declaredSlugs = CATEGORIES.map(category => category.slug).sort();

function productsIn(slug: string): number {
  return products.filter(product => product.category === slug).length;
}

function brandsIn(slug: string): string[] {
  return getProductsByCategory(slug).map(product => product.brand);
}

describe('Category taxonomy', () => {
  describe('slug coverage', () => {
    // Invariant: no orphan in either direction. A CATEGORIES slug with no
    // products renders a dead filter chip that can only ever return an empty
    // grid; a product.category missing from CATEGORIES makes those products
    // unreachable from every category entry point.
    it('declares every category the catalogue uses, and nothing else', () => {
      expect(declaredSlugs).toEqual(catalogueSlugs);
    });

    // Invariant: the derivation dedupes on `slug`, so a duplicate here would
    // render one category twice in the mega menu, the header and the footer,
    // with the copies disagreeing about the count.
    it('declares each slug exactly once', () => {
      expect(new Set(declaredSlugs).size).toBe(CATEGORIES.length);
    });

    // Invariant: every declared slug is backed by real stock, so a category can
    // never advertise itself over an empty result set.
    it('never declares a slug that no product carries', () => {
      for (const category of CATEGORIES) {
        expect(productsIn(category.slug)).toBeGreaterThan(0);
      }
    });
  });

  describe('counts', () => {
    // Invariant: `count` is what the filter will actually return, so it has to
    // be the true size of the bucket rather than a number somebody typed.
    it('matches the real number of products in each category', () => {
      for (const category of CATEGORIES) {
        expect({ slug: category.slug, count: category.count }).toEqual({
          slug: category.slug,
          count: productsIn(category.slug),
        });
      }
    });

    // Invariant: the sum catches a count that is right on its own category but
    // wrong on another. A per-category check can all pass while the totals lie
    // if one bucket is over-counted by exactly as much as another is under.
    it('sums to the size of the catalogue, so nothing is uncounted or double-counted', () => {
      const total = CATEGORIES.reduce((sum, category) => sum + category.count, 0);
      expect(total).toBe(products.length);
    });

    // Invariant: the badge count and the query the filter runs must never
    // disagree. If `getProductsByCategory` were changed to match on slug or to
    // case-fold, this is the test that catches the number outrunning the grid.
    it('agrees with what getProductsByCategory actually returns', () => {
      for (const category of CATEGORIES) {
        expect(getProductsByCategory(category.slug)).toHaveLength(category.count);
      }
    });
  });

  describe('CATEGORY_SLUGS', () => {
    // Invariant: CATEGORY_SLUGS is the membership test that validates the
    // `?category=` query param. A missing slug silently drops the param; a
    // phantom slug accepts a filter that matches nothing and renders the empty
    // state as though the shopper had asked for it.
    it('holds exactly the CATEGORIES slugs', () => {
      expect([...CATEGORY_SLUGS].sort()).toEqual(declaredSlugs);
    });

    it('has no duplicates, so the Set cannot hide a stale extra member', () => {
      expect(CATEGORY_SLUGS.size).toBe(CATEGORIES.length);
    });

    // Invariant: membership is what the products page branches on, so it has to
    // agree with the catalogue — a param pointing at a real category is honoured.
    it('accepts every slug the catalogue uses and rejects the rest', () => {
      for (const slug of catalogueSlugs) {
        expect(CATEGORY_SLUGS.has(slug)).toBe(true);
      }
      expect(CATEGORY_SLUGS.has('not-a-real-category')).toBe(false);
    });
  });

  describe('categoryHref', () => {
    // Invariant: the slug travels in the query string, so it has to survive a
    // parse round-trip byte-for-byte or the filter silently resets on click.
    it('round-trips the slug through URL parsing', () => {
      for (const category of CATEGORIES) {
        const url = new URL(categoryHref(category.slug), 'https://store.test');

        expect(url.pathname).toBe('/products');
        expect(url.searchParams.get('category')).toBe(category.slug);
      }
    });

    // Invariant: `encodeURIComponent` is what stops an untrusted slug forging
    // extra query params. A bare `&` would let `?category=a&sale=true` through
    // and silently change what the shopper is shown.
    it('percent-encodes a slug that would otherwise break the query string', () => {
      const href = categoryHref('cables & stands/stands?x=1');

      expect(href).toBe('/products?category=cables%20%26%20stands%2Fstands%3Fx%3D1');
      expect(href).not.toContain('&stands');
      expect(new URL(href, 'https://store.test').searchParams.get('category')).toBe(
        'cables & stands/stands?x=1'
      );
    });

    // Invariant: the result is dropped straight into an href, so a space or a
    // quote left literal is rewritten under the shopper by the browser.
    it('emits a path with no unescaped characters', () => {
      for (const category of CATEGORIES) {
        expect(categoryHref(category.slug)).toMatch(/^\/products\?category=[^\s"'<>]+$/);
      }
    });

    // Invariant: CATEGORIES[].href is stored at module load rather than computed
    // at render time, so a stale literal here would outlive a change to
    // categoryHref itself and quietly diverge from the filter links.
    it('is the href each declared category carries', () => {
      for (const category of CATEGORIES) {
        expect(category.href).toBe(categoryHref(category.slug));
      }
    });
  });

  describe('categoryDisplayName', () => {
    // Invariant: the heading and the clear-filter chip must show the
    // hand-written name, not a humanised slug. "Guitars Basses" in place of
    // "Guitars & Basses" is the regression this guards.
    it('returns the declared name for a known slug', () => {
      expect(categoryDisplayName('guitars-basses')).toBe('Guitars & Basses');
      expect(categoryDisplayName('keyboards-synths')).toBe('Keyboards & Synths');
    });

    it('returns the declared name for every declared slug', () => {
      for (const category of CATEGORIES) {
        expect(categoryDisplayName(category.slug)).toBe(category.name);
      }
    });

    // Invariant: the fallback exists so a slug that reaches the data without a
    // CATEGORY_META entry still reads as English rather than rendering a blank
    // heading. `undefined` or '' is the failure it was written to prevent.
    it('humanises an unknown slug instead of returning undefined or an empty string', () => {
      const unknownSlugs = ['cables-and-cases', 'pedalboards', 'studio-monitors-v2', 'x'];

      for (const slug of unknownSlugs) {
        const name = categoryDisplayName(slug);

        expect(name).toBeDefined();
        expect(name).not.toBe('');
        expect(name.trim()).toBe(name);
        // "Readable" means each hyphen-separated word is capitalised, so
        // "cables-and-cases" reads as "Cables And Cases" and not "cables-and-cases".
        for (const word of name.split(' ')) {
          expect(word.charAt(0)).toBe(word.charAt(0).toUpperCase());
        }
      }
    });

    // Invariant: every declared category has a visible heading, and it is never
    // the raw machine slug. `name` is rendered unguarded in the mega menu, the
    // header, the footer and the home category grid, so a blank or slug-shaped
    // label ships straight to the customer. (Note the humanised fallback can
    // legitimately coincide with a declared name — `recording-gear` reads as
    // "Recording Gear" either way — so this checks the outcome, not the path.)
    it('labels every declared category with a non-empty, non-slug name', () => {
      for (const category of CATEGORIES) {
        expect(category.name).not.toBe('');
        expect(category.name.trim()).toBe(category.name);
        expect(category.name).not.toBe(category.slug);
      }
    });
  });

  describe('brandsInCategory', () => {
    // Invariant: the mega menu lists the brands a shopper can filter to. A brand
    // that stocks nothing in the category offers a checkbox that empties the
    // grid the moment it is ticked.
    it('returns only brands that stock the category', () => {
      for (const category of CATEGORIES) {
        const stocked = new Set(brandsIn(category.slug));

        for (const brand of brandsInCategory(category.slug)) {
          expect({ slug: category.slug, brand: brand.name, stocked: stocked.has(brand.name) }).toEqual(
            { slug: category.slug, brand: brand.name, stocked: true }
          );
        }
      }
    });

    // Invariant: the converse. An over-tight filter that drops a brand the
    // shopper can plainly see products from fails here even though the previous
    // test still passes.
    it('returns every brand that stocks the category', () => {
      for (const category of CATEGORIES) {
        const listed = brandsInCategory(category.slug).map(brand => brand.name).sort();

        expect(listed).toEqual([...new Set(brandsIn(category.slug))].sort());
      }
    });

    // Invariant: `brandsInCategory` filters the storewide BRANDS list, so a
    // brand whose only products live elsewhere must not leak through.
    it('excludes brands whose only products are in other categories', () => {
      const inGuitars = brandsInCategory('guitars-basses').map(brand => brand.name);

      expect(inGuitars).not.toContain('Korg');
      expect(inGuitars).not.toContain('Shure');
    });

    // Invariant: "most stocked first" is the documented order the mega menu is
    // laid out for: counts non-increasing, ties broken by name so the menu
    // cannot reshuffle between renders of the same catalogue.
    it('sorts by count descending, then by name ascending', () => {
      for (const category of CATEGORIES) {
        const brands = brandsInCategory(category.slug);

        for (let index = 1; index < brands.length; index += 1) {
          const previous = brands[index - 1];
          const current = brands[index];
          const inOrder =
            previous.count > current.count ||
            (previous.count === current.count && previous.name.localeCompare(current.name) <= 0);

          expect({
            slug: category.slug,
            pair: `${previous.name}(${previous.count}) then ${current.name}(${current.count})`,
            inOrder,
          }).toEqual({
            slug: category.slug,
            pair: `${previous.name}(${previous.count}) then ${current.name}(${current.count})`,
            inOrder: true,
          });
        }
      }
    });

    // Invariant: the count is the brand's storewide total, shared across every
    // category it appears in, so the same brand cannot read 2 in one menu and 3
    // in another.
    it('carries the storewide brand count', () => {
      const counts = new Map(BRANDS.map(brand => [brand.name, brand.count]));

      for (const brand of brandsInCategory('guitars-basses')) {
        expect({ brand: brand.name, count: brand.count }).toEqual({
          brand: brand.name,
          count: counts.get(brand.name),
        });
      }
    });

    // Invariant: an unknown slug is not a crash. `?category=` is
    // attacker-controlled, so this path is reachable with any string at all.
    it('returns an empty list for an unknown slug', () => {
      expect(brandsInCategory('not-a-real-category')).toEqual([]);
    });

    // Invariant: every brand in the catalogue stocks at least one category, so
    // the brand filter can never offer a brand whose every product is excluded
    // by the category filter sitting next to it.
    it('leaves no brand unreachable across the taxonomy', () => {
      const reachable = new Set(
        CATEGORIES.flatMap(category => brandsInCategory(category.slug).map(brand => brand.name))
      );

      for (const brand of BRANDS) {
        expect({ brand: brand.name, reachable: reachable.has(brand.name) }).toEqual({
          brand: brand.name,
          reachable: true,
        });
      }
    });
  });
});
