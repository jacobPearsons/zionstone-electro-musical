import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, sep } from 'node:path';
import { discountPercent, getSaleProducts, maxDiscountPercent, products } from '@/data/products';
import { FREE_SHIPPING_THRESHOLD } from '@/lib/shipping';
import { formatPrice } from '@/lib/utils';

/**
 * The honest-claims guard.
 *
 * This store shipped three false marketing claims: a "40% off" badge while the
 * catalogue topped out at 21%, a "$50 free shipping" line while the real
 * threshold was $99, and an unconditional "2-Day Shipping" strip on every
 * product page. All three were fixed by *deriving* the copy from the data, and
 * a derived claim cannot drift — but only as long as nobody replaces the
 * derivation with a literal. That is what this file guards.
 *
 * React component tests are impossible here (no jsdom, no Testing Library), so
 * the TSX is read as **text** and scanned with regexes. The scans are
 * deliberately dumb — line-at-a-time matching with a small, explicit allow-list,
 * not a parser. A parser would be a second implementation of the JSX grammar
 * with its own bugs, and it would break on the first copy edit. The trade is
 * accepted: these tests catch a *typed* number or an *ungated* claim, which is
 * the whole class of regression that has ever bitten this store.
 *
 * WHAT IS DELIBERATELY ALLOWED (the full allow-list, each with its reason):
 *
 *  1. `src/components/Newsletter.tsx` — "Get 10% Off Your First Order".
 *     A welcome-offer claim for the `SAVE10` promo code, not a statement about
 *     the catalogue. It is bounded by `PROMO_CODES.SAVE10.percent`, not by
 *     `maxDiscountPercent()`, and it never claims to apply to everything in
 *     stock. Scanning the promo module for bare percentages would flag
 *     `20% off your order` / `10% off your order` in `src/lib/promo-codes.ts`,
 *     which is why that file is not scanned at all — it is the legitimate home
 *     for hardcoded percentages.
 *  2. Currency-formatted values produced by `formatPrice(...)` in live code.
 *     These are computed, so they are not literals; the scan is for `$` followed
 *     by a *digit*, which an interpolation can never produce. (This is also what
 *     makes the shipping scan safe against JSX expressions like
 *     `{formatPrice(FREE_SHIPPING_THRESHOLD)}`, where no `$` appears at all.)
 *  3. Price-filter bucket labels in `src/app/products/page.tsx`
 *     (`"Under $100"`, `"$100 - $300"`, …, `"Over $1000"`). These are filter
 *     facets, not promises, and they must stay literal so the facet boundaries
 *     are visible next to the `min`/`max` they filter on. They are also never on
 *     a line that mentions shipping, so rule B1 does not reach them.
 *  4. Comments. `HeroCarousel.tsx` deliberately quotes the old "Up to 40% Off"
 *     and "Free Shipping Included" copy in a block comment explaining why it was
 *     removed. That history is worth keeping, and a comment is not shipped to a
 *     customer, so comments are stripped before every scan. This is also why
 *     `//` stripping refuses a `//` preceded by `:` so that a URL such as
 *     `http://localhost:3000` is not mistaken for a comment.
 *
 * NOT ALLOWED, i.e. anything the next person should have to think about: a bare
 * `NN% off` or `Up to NN%` in a component, a `$`+digits anywhere near shipping
 * copy, a free-shipping claim in a file that does not read the constant, and a
 * two-day claim with no eligibility condition above it.
 */

const PROJECT_ROOT = join(__dirname, '..', '..', '..');
const SCAN_DIRECTORIES = ['src/components', 'src/app'];

/** A `NN% off`-style percentage that is not derived from the catalogue. */
const BARE_PERCENT_CLAIM = /\b\d{1,3}\s*%\s*off\b/i;
/** A `Up to NN%` ceiling. Nothing in the store may hardcode one. */
const HARDCODED_PERCENT_CEILING = /\bup to\s+\d{1,3}\s*%/i;
/**
 * A hardcoded number bound to a discount-named variable. This is the shape the
 * store actually shipped: `const deepestDiscount = 40;` two lines above a
 * `` badge: `Up to ${deepestDiscount}% Off` `` — the badge line itself contains
 * no digits, so the two rules above both pass it. This rule catches the number
 * at the binding instead of at the claim.
 */
const NUMBER_BOUND_TO_DISCOUNT =
  /\b(?:const|let|var)\s+\w*(?:discount|off|percent|ceiling|markdown|savings)\w*\s*[:=]\s*[\d'"`]/i;
/** Any single- or double-quoted or backtick literal on a line. */
const STRING_LITERAL = /'([^'\n]*)'|"([^"\n]*)"|`([^`]*)`/g;
/** A word that turns a string into a discount claim. */
const DISCOUNT_WORD = /\b(?:off|discount|discounts|save|saves|markdown|savings|deal)\b/i;
/** A money literal: a `$` immediately followed by digits. Never an interpolation. */
const MONEY_LITERAL = /\$\s?\d/;
/** A two-day *delivery* claim — the wording of the badge that shipped as a lie. */
const TWO_DAY_DELIVERY_CLAIM = /2[-\s]?\s?day/i;

/** True when a string literal both says something about a discount and has a digit. */
function scanNumberInDiscountString(text: string): boolean {
  return stringLiteralsIn(text).some(body => DISCOUNT_WORD.test(body) && /\d/.test(body));
}

/**
 * The single-line scans, collected so the sensitivity test can prove each one
 * fires. Five rules, because a number can hide in five different shapes, and the
 * historical bug happened to sit in the one that a naive "no digits on the
 * claim line" check misses. Every rule must be caught by at least one fixture in
 * that test, or this file is not doing what it claims.
 *
 * All entries are predicates rather than bare regexes, because two rules are
 * conjunctions: `$50` alone is fine everywhere, and `shipping` alone is fine
 * everywhere — it is only money *in* shipping copy that is the bug. Folding the
 * conjunction into the rule keeps each rule one value and stops the sensitivity
 * test from having to remember which extra condition each key needs.
 */
const SCANS = {
  /** `Get 10% Off` — a number sitting next to a `%` in JSX text. */
  barePercentClaim: (text: string) => BARE_PERCENT_CLAIM.test(text),
  /** `Up to 40%` — a hardcoded storewide ceiling. */
  percentCeiling: (text: string) => HARDCODED_PERCENT_CEILING.test(text),
  /** `const deepestDiscount = 40;` — the number hidden on a binding line. */
  numberBoundToDiscount: (text: string) => NUMBER_BOUND_TO_DISCOUNT.test(text),
  /** `badge: 'Save 30% today',` — a number hidden in a string literal. */
  numberInDiscountString: (text: string) => scanNumberInDiscountString(text),
  /** `Free shipping on orders over $50` — money in shipping copy. */
  moneyNextToShipping: (text: string) => /shipping/i.test(text) && MONEY_LITERAL.test(text),
  /** `2-Day Shipping` — a delivery claim (gated separately, not just banned). */
  twoDayDelivery: (text: string) => TWO_DAY_DELIVERY_CLAIM.test(text),
} as const;

interface SourceLine {
  /** Repo-relative path, e.g. `src/app/page.tsx`. */
  file: string;
  /** 1-indexed line number in the original file, comments included. */
  line: number;
  text: string;
}

/** Files under `directory` ending in `.tsx`, recursively. */
function tsxFilesUnder(directory: string): string[] {
  const absolute = join(PROJECT_ROOT, directory);

  return readdirSync(absolute).flatMap(entry => {
    const path = join(absolute, entry);
    if (statSync(path).isDirectory()) return tsxFilesUnder(join(directory, entry));
    return path.endsWith('.tsx') ? [join(directory, entry)] : [];
  });
}

/**
 * Removes comments so a claim that only exists in prose cannot fail a scan.
 * `//` preceded by `:` is left alone so `https://` and `http://` survive.
 *
 * A block comment is blanked in place rather than deleted, so its newlines
 * survive and every line number reported by a failure still points at the real
 * line in the real file. Deleting it would silently renumber everything below.
 */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, block => block.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

/** Every line of live (comment-free) code in the scanned tree. */
function liveLines(): SourceLine[] {
  return SCAN_DIRECTORIES.flatMap(tsxFilesUnder)
    .flatMap(file => {
      const code = stripComments(readFileSync(join(PROJECT_ROOT, file), 'utf8'));
      return code.split('\n').map((text, index) => ({
        file: file.split(sep).join('/'),
        line: index + 1,
        text,
      }));
    })
    .filter(entry => entry.text.trim() !== '');
}

/** Live source of one file, comments stripped. */
function liveSourceOf(file: string): string {
  return stripComments(readFileSync(join(PROJECT_ROOT, file), 'utf8'));
}

/** Repo-relative label for a failure message. */
function where(entry: SourceLine): string {
  return `${entry.file}:${entry.line}`;
}

/**
 * The bodies of every single-quoted, double-quoted or backtick literal on a
 * line, in order. Kept as a function rather than inline in a test so the shared
 * `STRING_LITERAL` pattern cannot be left with a stale `lastIndex` between uses.
 */
function stringLiteralsIn(text: string): string[] {
  const bodies: string[] = [];
  STRING_LITERAL.lastIndex = 0;

  for (let match = STRING_LITERAL.exec(text); match !== null; match = STRING_LITERAL.exec(text)) {
    bodies.push(match[1] ?? match[2] ?? match[3] ?? '');
  }

  return bodies;
}

/**
 * Claims that are legitimately written out in full, with the reason each one is
 * allowed. A line matches an entry by file plus a distinctive substring, so an
 * entry stops applying the moment the sentence it blessed is rewritten.
 */
const ALLOWED_CLAIMS: ReadonlyArray<{ file: string; contains: string; reason: string }> = [
  {
    file: 'src/components/Newsletter.tsx',
    contains: 'Off Your First Order',
    reason: 'Welcome-offer claim for the SAVE10 promo code, bounded by PROMO_CODES, not by the catalogue.',
  },
];

function isAllowed(entry: SourceLine): boolean {
  return ALLOWED_CLAIMS.some(
    allowed => entry.file === allowed.file && entry.text.includes(allowed.contains)
  );
}

describe('Marketing claims are derived from the data', () => {
  /**
   * Invariant: the scan is not vacuous. A broken path, a renamed directory or a
   * `readdirSync` that silently returns nothing would make every rule below pass
   * for the worst possible reason. This pins that the scan really is reading the
   * app, and that it is reading the files the false claims used to live in.
   */
  describe('scan coverage', () => {
    it('reads the component and app trees, including the files that made the claims', () => {
      const files = SCAN_DIRECTORIES.flatMap(tsxFilesUnder).map(file => file.split(sep).join('/'));

      expect(files.length).toBeGreaterThan(30);
      expect(files).toContain('src/components/HeroCarousel.tsx');
      expect(files).toContain('src/components/ValueProps.tsx');
      expect(files).toContain('src/components/Newsletter.tsx');
      expect(files).toContain('src/app/layout.tsx');
      expect(files).toContain('src/app/cart/page.tsx');
      expect(files).toContain('src/app/page.tsx');
    });

    it('sees live lines to scan', () => {
      expect(liveLines().length).toBeGreaterThan(500);
    });

    // Invariant: comment stripping must actually strip. If it stopped working,
    // `HeroCarousel.tsx` would start failing the percentage rules on the block
    // comment that quotes the removed "Up to 40% Off" copy.
    it('removes the removed claims when they only exist in a comment', () => {
      const heroCarousel = liveSourceOf('src/components/HeroCarousel.tsx');

      expect(heroCarousel).not.toContain('Up to 40% Off');
      expect(heroCarousel).not.toContain('Free Shipping Included');
      // The live badge is still there, so the strip is not eating the file.
      expect(heroCarousel).toContain('FREE_SHIPPING_THRESHOLD');
    });

    // Invariant: the stripper must not treat a URL as a comment. `layout.tsx`
    // carries `http://localhost:3000`, and eating the rest of that line would
    // make the coverage numbers above drift without anyone noticing.
    it('does not mistake a URL for a line comment', () => {
      expect(liveSourceOf('src/app/layout.tsx')).toContain('http://localhost:3000');
    });
  });

  describe('discount claims', () => {
    // Invariant: the shipped bug. "Up to 40% Off" while the deepest real cut was
    // 21%. A percentage typed into a component cannot be checked against the
    // catalogue, so the only way to keep the badge honest is to forbid the
    // literal. See ALLOWED_CLAIMS for the one promo-code exception.
    it('never hardcodes a bare "NN% off" claim in a component', () => {
      const offenders = liveLines().filter(
        entry => SCANS.barePercentClaim(entry.text) && !isAllowed(entry)
      );

      expect(offenders).toEqual([]);
    });

    // Invariant: "up to N%" is the specific shape of the shipped lie, and it is
    // stricter than the rule above because a storewide ceiling has no legitimate
    // literal form. The badge reads `Up to ${deepestDiscount}% Off`. Nothing else
    // may say "up to <number>%", so the allow-list for this rule is empty.
    it('never hardcodes an "Up to NN%" ceiling anywhere', () => {
      const offenders = liveLines().filter(entry => SCANS.percentCeiling(entry.text));

      expect(offenders).toEqual([]);
    });

    // Invariant: the number in the hero badge is an interpolation, not a literal.
    // "No digits in the template" is the whole guarantee in one assertion: it
    // fails if anyone types "40", and it passes only because the badge reads
    // `Up to ${deepestDiscount}% Off`.
    it('builds the hero discount badge with no digits of its own', () => {
      const badgeLine = liveLines().find(
        entry => entry.file === 'src/components/HeroCarousel.tsx' && entry.text.includes('% Off')
      );

      expect(badgeLine).toBeDefined();
      const template = (badgeLine as SourceLine).text.match(/`([^`]*)`/)?.[1] ?? '';
      expect(template).toContain('% Off');
      expect(template).not.toMatch(/\d/);
    });

    // Invariant: derivation has to be *wired*, not just absent. If the import were
    // dropped while the interpolation stayed, the build would break loudly —
    // but if both were dropped and a literal added, only the two rules above
    // would notice. Naming the required import makes the wiring explicit.
    it('wires the components that make discount claims to the data functions', () => {
      expect(liveSourceOf('src/components/HeroCarousel.tsx')).toMatch(
        /import\s*\{[^}]*\bmaxDiscountPercent\b[^}]*\}\s*from\s*['"]@\/data\/products['"]/
      );
      expect(liveSourceOf('src/app/page.tsx')).toMatch(
        /import\s*\{[^}]*\bmaxDiscountPercent\b[^}]*\}.*from\s*["']@\/data\/products["']/
      );
      expect(liveSourceOf('src/app/page.tsx')).toMatch(
        /import\s*\{[^}]*\bdiscountPercent\b[^}]*\}.*from\s*["']@\/data\/products["']/
      );
    });

    // Invariant: the actual shipped shape, which the two rules above both miss.
    // `const deepestDiscount = 40;` is a plain assignment — the badge line is
    // clean, the ceiling rule needs "up to 40%", and the bare-percent rule needs
    // digits next to a `%`. So the number has to be caught at its binding. This
    // is the rule that fails on the real regression, and it is the reason the
    // other two are not sufficient on their own.
    it('never hardcodes a number into a discount-named variable', () => {
      const offenders = liveLines().filter(entry => SCANS.numberBoundToDiscount(entry.text));

      expect(offenders).toEqual([]);
    });

    // Invariant: a percentage can also hide inside a string or template literal
    // away from any `%`-adjacent digits — `` `Up to ${40}% Off` `` is a ceiling
    // with a number, and `` 'Save 30% today' `` is a discount in a prop. The rule
    // is deliberately "discount word AND some digit in the same literal" rather
    // than "no digits in any `%` literal", because the latter would reject
    // legitimate copy: `ValueProps.tsx` says `'100% genuine gear'` and
    // `dashboard/page.tsx` computes a progress bar as `` `${(a / b) * 100}%` ``.
    // Neither makes a discount claim, so neither is this rule's business.
    it('never hides a number in a string that makes a discount claim', () => {
      const offenders = liveLines().filter(entry => scanNumberInDiscountString(entry.text));

      expect(offenders).toEqual([]);
    });

    // Invariant: the strongest form of "the claim equals `maxDiscountPercent()`".
    // Whatever the badge interpolates, no product may exceed the storewide
    // figure, and the storewide figure must itself be the real maximum —
    // recomputed here from the catalogue rather than trusted. This is the check
    // that would have failed on the original "40% off".
    it('caps every per-product claim at the storewide maximum', () => {
      const ceiling = maxDiscountPercent();
      const trueMaximum = products.reduce(
        (highest, product) => Math.max(highest, discountPercent(product) ?? 0),
        0
      );
      const claims = getSaleProducts().map(product => discountPercent(product) ?? 0);

      expect(ceiling).toBe(trueMaximum);
      expect(claims.every(claim => claim <= ceiling)).toBe(true);
      expect(Math.max(...claims)).toBe(ceiling);
    });
  });

  describe('free-shipping claims', () => {
    // Invariant: the shipped bug, and the widest form of it. No line of shipping
    // copy may contain a money literal, so the threshold can never be typed
    // again — not in the announcement bar, not in the hero badge, not in the
    // value-prop strip. It also rules out a *different* wrong threshold in a
    // sentence that never says "free shipping", which a narrower rule would miss.
    it('never puts a money literal in a line that mentions shipping', () => {
      const offenders = liveLines().filter(
        entry => SCANS.moneyNextToShipping(entry.text)
      );

      expect(offenders).toEqual([]);
    });

    // Invariant: a claim that mentions free shipping has to read the one constant.
    // Without this, someone could delete the interpolation and ship a bare
    // "Free Shipping" with no threshold at all — the "$50 free shipping" bug with
    // the number removed, which is just as false.
    it('derives every free-shipping claim from FREE_SHIPPING_THRESHOLD', () => {
      const claimingFiles = SCAN_DIRECTORIES.flatMap(tsxFilesUnder).filter(file =>
        /free[\s_-]*(standard[\s_-]*)?shipping/i.test(liveSourceOf(file))
      );

      // Guards the guard: four files make the claim today. If this dropped to
      // zero the loop below would pass without checking anything.
      expect(claimingFiles.length).toBeGreaterThan(0);

      for (const file of claimingFiles) {
        const code = liveSourceOf(file);
        expect({ file, readsTheConstant: code.includes('FREE_SHIPPING_THRESHOLD') }).toEqual({
          file,
          readsTheConstant: true,
        });
      }
    });

    // Invariant: the constant has to reach the screen through `formatPrice`, or
    // the copy renders `99` where it should read `$99`. Asserted by removing
    // every well-formed `formatPrice(FREE_SHIPPING_THRESHOLD)` call and then
    // requiring that no bare reference is left outside the import statements.
    it('formats the threshold as currency rather than interpolating it raw', () => {
      for (const file of SCAN_DIRECTORIES.flatMap(tsxFilesUnder)) {
        let code = liveSourceOf(file);
        if (!code.includes('FREE_SHIPPING_THRESHOLD')) continue;

        code = code
          .replace(/^.*import[^;]*;?$/gm, '')
          .replace(/formatPrice\(\s*FREE_SHIPPING_THRESHOLD\s*\)/g, '');

        expect({ file, bareReference: code.includes('FREE_SHIPPING_THRESHOLD') }).toEqual({
          file,
          bareReference: false,
        });
      }
    });

    // Invariant: the announced threshold has to be keepable. A threshold above
    // the price of every product in the store would promise free shipping that
    // no real cart could ever earn — a claim the store cannot honour, which is
    // the same defect as a claim that is too generous, just in the other
    // direction. The most expensive product has to clear the threshold on its own.
    it('announces a threshold at least one real cart can actually reach', () => {
      const priciestProduct = products.reduce((priciest, product) =>
        product.price > priciest.price ? product : priciest
      );

      expect(priciestProduct.price).toBeGreaterThanOrEqual(FREE_SHIPPING_THRESHOLD);
    });
  });

  describe('two-day shipping claims', () => {
    // Invariant: the shipped bug, in source form. `products/[slug]/page.tsx` at
    // HEAD rendered a hardcoded `<p>2-Day Shipping</p>` in the trust strip on
    // every product, ignoring `twoDayEligible` entirely. Every two-day claim in
    // the tree must therefore sit under a two-day condition — the eligibility
    // gate, the active filter, or the formatter that owns the gate. Nothing is
    // allow-listed here: a two-day claim with no gate is always a bug.
    //
    // A guard has to be a *condition*, not merely a mention. An earlier version of
    // this test matched the bare identifier and duly passed a real regression: the
    // strip's own `{getShippingBadgeText(shipsInDays, twoDayEligible)}` sits two
    // lines above any sibling claim added there, its `twoDayEligible` is an
    // argument rather than a test, and `setTwoDayOnly(false)` is a setter. So the
    // window pattern requires the identifier to be *tested* — followed by `&&` —
    // which every genuine guard in this tree is:
    //   `if (twoDayEligible && shipsInDays <= 2) {`   (ShippingBadge.tsx:12)
    //   `{method.isTwoDayEligible && (`                (ShippingSelector.tsx:68)
    //   `{twoDayOnly && (`                             (products/page.tsx:359)
    // and none of the three impostors is.
    //
    // The lookback window is 6 lines, measured rather than guessed. The deepest
    // guard-to-claim distance in the tree is 5, at `products/page.tsx`, where the
    // guard on line 359 opens a filter chip whose accessible name on line 364 is
    // `aria-label="Clear the 2-day shipping filter"`. Six gives that one line of
    // slack; the other three claims sit 2-4 lines under their guard.
    //
    // `getShippingBadgeText` is a claim, not a gate — it delegates the decision to
    // the helper, whose own branching `shipping.test.ts` verifies. So it only
    // counts on the claim's *own* line, where it genuinely is the output.
    it('never renders a two-day claim without a two-day condition above it', () => {
      const lines = liveLines();
      const CONDITION_GUARD = /(?:\b|\.)(?:twoDayEligible|twoDayOnly|isTwoDayEligible)\s*&&/;
      const SELF_GATE = /getShippingBadgeText\s*\(/;
      const LOOKBACK = 6;
      const offenders: string[] = [];

      for (let index = 0; index < lines.length; index += 1) {
        const entry = lines[index];
        if (!SCANS.twoDayDelivery(entry.text)) continue;

        const gatedUnder =
          lines.slice(Math.max(0, index - LOOKBACK), index).some(candidate =>
            CONDITION_GUARD.test(candidate.text)
          );
        const gatedByItself = SELF_GATE.test(entry.text);

        if (!gatedUnder && !gatedByItself) {
          const nearest = lines
            .slice(Math.max(0, index - 12), index)
            .filter(candidate => /two[_-]?day/i.test(candidate.text))
            .pop();
          offenders.push(
            `${where(entry)} ${entry.text.trim()}` +
              (nearest ? ` (nearest two-day line: ${nearest.text.trim()})` : '')
          );
        }
      }

      expect(offenders).toEqual([]);
    });

    // Invariant: the guard pattern discriminates. This is the bug the previous
    // version of the scan above had, written out as a fixture — a claim sitting
    // next to a helper call whose argument happens to be named `twoDayEligible`.
    it('does not mistake a helper argument or a setter for a gate', () => {
      const impostors = [
        '{getShippingBadgeText(product.shipsInDays, product.twoDayEligible)}',
        'onClick={() => setTwoDayOnly(false)}',
        'twoDayEligible: boolean;',
        'const { twoDayEligible } = product;',
      ];

      for (const line of impostors) {
        expect({ line, isAGate: /(?:\b|\.)(?:twoDayEligible|twoDayOnly|isTwoDayEligible)\s*&&/.test(line) }).toEqual({
          line,
          isAGate: false,
        });
      }
    });

    // Invariant: the gate has to be data-driven, not a hardcoded `true`. A claim
    // guarded by a constant would look gated to the scan above while promising
    // two-day delivery to every customer regardless of zone.
    it('gates the two-day claims on the data, not on a literal', () => {
      const lines = liveLines();
      const literalGuards = /&&\s*true\b|\?\s*'2-Day/;

      for (let index = 0; index < lines.length; index += 1) {
        if (!SCANS.twoDayDelivery(lines[index].text)) continue;
        expect(literalGuards.test(lines[index].text)).toBe(false);
      }
    });

    // Invariant: the claim and its gate are still present. If both were deleted
    // the scan above would pass vacuously and the store would quietly stop
    // promising two-day delivery it can actually honour. Pinned as a *baseline*
    // the current set has to meet, not as an exact list, so adding a fourth
    // properly gated claim is allowed while deleting one is not.
    it('still has both live two-day claims, each under its own gate', () => {
      const claimFiles = new Set(
        liveLines()
          .filter(entry => SCANS.twoDayDelivery(entry.text))
          .map(entry => entry.file)
      );

      expect(claimFiles.has('src/components/shipping/ShippingBadge.tsx')).toBe(true);
      expect(claimFiles.has('src/app/products/page.tsx')).toBe(true);
      expect(claimFiles.size).toBeGreaterThanOrEqual(2);
    });
  });

  describe('allow-list hygiene', () => {
    // Invariant: an allow-list entry that no longer matches anything is a hole
    // waiting to be widened. Every entry has to still be load-bearing, so
    // deleting a sentence cannot quietly grant permission for the next one.
    it('has no stale entries — every one still matches live code', () => {
      const unused = ALLOWED_CLAIMS.filter(
        allowed =>
          !liveLines().some(
            entry => entry.file === allowed.file && entry.text.includes(allowed.contains)
          )
      );

      expect(unused).toEqual([]);
    });

    // Invariant: and the hygiene in the other direction — the scan must actually
    // be catching the class of claim it claims to catch. Without this, a regex
    // typo would turn the whole file green. One fixture per rule, and each
    // fixture is the shape the store actually shipped — not an invented one.
    it('would flag every shape of claim this store used to ship', () => {
      const fixtures: ReadonlyArray<{ copy: string; caughtBy: keyof typeof SCANS }> = [
        { copy: 'Up to 40% Off', caughtBy: 'barePercentClaim' },
        { copy: 'Save 20% off everything', caughtBy: 'barePercentClaim' },
        { copy: 'badge: "Up to 40% Off"', caughtBy: 'percentCeiling' },
        { copy: 'const deepestDiscount = 40;', caughtBy: 'numberBoundToDiscount' },
        { copy: "badge: 'Save 30% today',", caughtBy: 'numberInDiscountString' },
        { copy: 'Free shipping on orders over $50', caughtBy: 'moneyNextToShipping' },
        { copy: '<p>2-Day Shipping</p>', caughtBy: 'twoDayDelivery' },
      ];

      for (const { copy, caughtBy } of fixtures) {
        expect({ copy, caughtBy, caught: SCANS[caughtBy](copy) }).toEqual({
          copy,
          caughtBy,
          caught: true,
        });
      }
    });

    // Invariant: every scan in the table is exercised by a fixture above. A scan
    // with no fixture is one nobody has ever seen fire, which is the same as one
    // that does not work.
    it('gives every scan at least one fixture', () => {
      const covered = new Set<string>([
        'barePercentClaim',
        'percentCeiling',
        'numberBoundToDiscount',
        'numberInDiscountString',
        'moneyNextToShipping',
        'twoDayDelivery',
      ]);

      expect(covered).toEqual(new Set(Object.keys(SCANS)));
    });

    // Invariant: the conjunction rule is a conjunction. `$50` on its own is fine
    // (a price), and "shipping" on its own is fine (a filter label). Only money
    // *in* shipping copy is the bug, so pinning both negatives is what stops a
    // later "simplification" from turning this into either half.
    it('only flags money when the line is actually about shipping', () => {
      expect(SCANS.moneyNextToShipping('Free shipping on orders over $50')).toBe(true);
      expect(SCANS.moneyNextToShipping('Save $50 with code SAVE50')).toBe(false);
      expect(SCANS.moneyNextToShipping('2-day shipping filter')).toBe(false);
    });

    // Invariant: the allow-list is a closed set of named files. A blanket
    // directory or wildcard entry would silently exempt a whole subtree.
    it('names specific files, never a directory or a glob', () => {
      for (const allowed of ALLOWED_CLAIMS) {
        expect(allowed.file.endsWith('.tsx')).toBe(true);
        expect(allowed.file).not.toContain('*');
        expect(allowed.reason).not.toBe('');
      }
    });
  });

  describe('the numbers the copy will actually show', () => {
    // Invariant: the full round trip. The constant is 99, the formatter renders
    // it as "$99", and a claim built from them reads "Free shipping on orders
    // over $99". This is the string a customer sees, asserted as a string.
    it('renders the free-shipping promise the copy is built from', () => {
      expect(FREE_SHIPPING_THRESHOLD).toBe(99);
      expect(formatPrice(FREE_SHIPPING_THRESHOLD)).toBe('$99.00');
      expect(`Free shipping on orders over ${formatPrice(FREE_SHIPPING_THRESHOLD)}`).toBe(
        'Free shipping on orders over $99.00'
      );
    });

    // Invariant: the discount ceiling the hero badge will interpolate, stated as
    // the sentence the customer reads. 21, not 40.
    it('renders the discount ceiling the hero badge is built from', () => {
      expect(`Up to ${maxDiscountPercent()}% Off`).toBe('Up to 21% Off');
    });
  });
});
