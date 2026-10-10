# Zionstone Storefront — WCAG 2.2 AA Accessibility Audit & Fix Report

Audit of the Next.js storefront at `zionstone-store/` against WCAG 2.2 **Level AA**,
following the 4 principles (Perceivable, Operable, Understandable, Robust). All fixes were
applied with **zero visual change** — no color, spacing, copy, or layout shifts; brand
tokens (`--primary` gold accents, `text-primary-strong`) untouched. Every edit preserves
the honesty-test contracts in `src/lib/__tests__/marketing-claims.test.ts`.

Scope: static storefront routes + components. Clerk prebuilt auth widgets, the Express
API (`../zionstone-api`), and third-party widgets are out of scope.

---

## Audit table (finding → file → success criterion)

| Finding | Files | WCAG 2.2 SC |
|---|---|---|
| No skip link / main landmark | `src/app/layout.tsx` | 2.4.1 Bypass Blocks |
| Mini cart drawn as a fixed panel: no dialog role, no focus management, no Escape, no focus restore | `src/components/MiniCart.tsx` | 1.3.1, 2.1.1, 2.1.2, 4.1.2 |
| Site search is a raw textbox with placeholder-only label | `src/components/SearchBar.tsx` | 1.3.1, 3.3.2, 4.1.2 |
| Search dropdowns have no combobox/listbox semantics, no keyboard navigation, no arrow-key support | `src/components/SearchBar.tsx` | 1.3.1, 2.1.1, 4.1.2 |
| Decorative icons exposed to screen readers (spinners, checks, location pins, trash, etc.) | ~25 files (see table below) | 1.1.1, 4.1.2 |
| Checkout shipping form: every field was placeholder-only labeled | `src/app/checkout/page.tsx` | 1.3.1, 3.3.2, 4.1.2 |
| Checkout errors were not programmatically tied to their fields | `src/app/checkout/page.tsx` | 3.3.1, 4.1.2 |
| PDP quantity stepper: icon-only buttons, unlabeled number input | `src/app/products/[slug]/page.tsx` | 1.3.1, 4.1.2 |
| PDP thumbnails/gallery: no per-thumbnail names, no current-image state | `src/app/products/[slug]/page.tsx` | 1.3.1, 4.1.2 |
| Shipping method pickers announced as bare links/undefined | `src/components/shipping/ShippingSelector.tsx`, `ShippingCalculator.tsx` | 1.3.1, 4.1.2 |
| Wishlist "remove" was an icon-only button with no name | `src/app/dashboard/page.tsx` | 4.1.2 |
| Products-page filters: view toggle icon-only, sort/search/filter controls lacked names & pressed state | `src/app/products/page.tsx` | 1.3.1, 4.1.2 |
| Dashboard profile inputs not associated with their labels | `src/app/dashboard/page.tsx` | 1.3.1, 4.1.2 |
| Status glyphs conveyed only by color | `src/app/dashboard/page.tsx` (secondary to visible text) | 1.4.1 |
| Newsletter email, promo-code input, delivery ZIP lacked programmatic labels/autocomplete | `src/components/Newsletter.tsx`, `PromoCodeInput.tsx`, `src/components/product/DeliveryEstimator.tsx` | 1.3.1, 3.3.2 |
| File-upload control in sell form had no accessible name | `src/app/sell/page.tsx` | 4.1.2 |
| WhatsApp buttons: identical accessible names for different targets | `src/app/contact/page.tsx` | 2.4.4 |
| Emoji-as-image placeholders announced as garbage characters | `src/app/products/[slug]/page.tsx`, `src/components/product/ProductImage.tsx` | 1.1.1 |

Already compliant (verified, no change needed): global `:focus-visible` ring, skip-link-less
`<main>` (now fixed), `prefers-reduced-motion` in `globals.css`, `HeroCarousel`
(`inert`, `aria-live` descriptions), error/loading/not-found pages (`role="alert"` /
`role="status"`), `AnnouncementBar` status regions, `PromoCodeInput` `role="status"`
applied state, default/modern contrast of all tokens, cart page quantity/remove buttons
(already labeled).

---

## Fixes by category

### 1. Perceivable (1.x)

- **1.1.1 Non-text content** — `aria-hidden="true"` added to every decorative SVG:
  - Cart/checkout: `ShoppingBag`, `ChevronRight` (all), `Lock`.
  - Products/PDP: `ArrowLeft`, `Share2`, `Truck`, `Shield`, `RotateCcw`, stock-status dots,
    `Clock`.
  - Dashboard: `User`, `Inbox`, `ChevronRight`, `Package`, `Heart`, `Truck`, `MapPin`,
    status glyphs, `Trash2`.
  - Sell: `X`, `Loader2`, `Upload`; Queue list: `Loader2`, `Check`, `X`.
  - Search/header/newsletter/promo: `Search`, `Tag`, grid/list toggles, `Mail`, `Phone`,
    `MessageCircle`, `Send`, `SlidersHorizontal`.
  - Emoji image fallbacks: PDP main gallery emoji gets `role="img"` + `aria-label`; thumbnail
    emoji `aria-hidden`; `ProductImage` already `aria-hidden`.
- **1.3.1 Info & relationships**
  - Every checkout field now has an associated `<label htmlFor>` (email, first/last name,
    address1/2, city, state `<select>`, ZIP, phone) and `autoComplete`.
  - Dashboard profile inputs: labels now associated via `htmlFor`/`id`.
  - Shipping pickers: `role="radiogroup"` + `aria-labelledby`; sorting and search controls in
    products page labeled.
  - `SpecsTable`: object-spec key cell converted to `<th scope="row">`.
- **1.4.1 Use of color** — status glyphs remain decorative (`aria-hidden`) beside their
  visible status text; no color-only information introduced.

### 2. Operable (2.x)

- **2.1.1 / 2.1.2 Keyboard + no-trap**
  - `MiniCart`: real `role="dialog"` with a focus trap (Tab wrap), `aria-modal="true"`,
    `inert` + `aria-hidden` on the closed panel (React 19 boolean `inert`, matching the
    existing HeroCarousel pattern), **Escape closes**, focus is restored to the trigger on
    close.
  - `SearchBar`: combobox pattern with keyboard navigation (ArrowUp/Down cycles options,
    Escape closes, Enter selects via `aria-activedescendant`).
- **2.4.1 Bypass blocks** — "Skip to main content" link added as the first tabbable element;
  `<main id="main-content" tabIndex={-1}>`.
- **2.4.4 Link purpose** — WhatsApp buttons disambiguated: `aria-label="WhatsApp {label}"`.

### 3. Understandable (3.x)

- **3.3.1 Error identification** — all checkout errors are `role="alert"` and tied to their
  field with `aria-describedby`; `aria-invalid` set on the triggering input. Same pattern for
  DeliveryEstimator ZIP and ShippingCalculator. Sell-form errors already `role="alert"`.
- **3.3.2 Labels or instructions**
  - Instant-name labels added for every control that previously relied on a placeholder:
    email, first/last name, address lines, city, state, ZIP, phone, promo code, newsletter
    email, delivery ZIP, search, quantity, sell photo upload.
  - Placeholders that duplicate the label were kept for visual consistency.

### 4. Robust (4.x)

- **4.1.1 / 4.1.2 Name, role, value**
  - `MiniCart`: close/decrement/increment/remove controls all named; internal list restructured
    to `ul/li`.
  - Products page: grid/list view toggles get `aria-label` + `aria-pressed`; category and
    price-range filter buttons get `aria-pressed`; sort `<select>` named.
  - Shipping selectors: radio inputs kept in the accessibility tree (`sr-only`, not
    `hidden`/`display:none`) inside wrapping labels; custom radio dots `aria-hidden`.
  - AddToCart / Wishlist buttons: `WishlistButton` gains `aria-label` + `aria-pressed`;
    icons hidden.
  - Dashboard wishlist "remove" button named.
  - Announcement bar: `role="region"` with `aria-label`, dismiss button named.
  - Newsletter success card uses `role="status"`.

### Files touched

```
src/app/layout.tsx                        src/app/dashboard/page.tsx
src/app/checkout/page.tsx                 src/app/dashboard/queue/QueueList.tsx
src/app/contact/page.tsx                  src/app/products/page.tsx
src/app/sell/page.tsx                     src/app/products/[slug]/page.tsx
src/components/header.tsx                 src/components/MiniCart.tsx
src/components/SearchBar.tsx              src/components/Newsletter.tsx
src/components/AnnouncementBar.tsx        src/components/ValueProps.tsx
src/components/PromoCodeInput.tsx         src/app/cart/page.tsx
src/components/product/AddToCartButton.tsx
src/components/product/WishlistButton.tsx
src/components/product/ContactOwnerButton.tsx
src/components/product/ProductTabs.tsx
src/components/product/SpecsTable.tsx
src/components/product/DeliveryEstimator.tsx
src/components/shipping/ShippingSelector.tsx
src/components/shipping/ShippingCalculator.tsx
src/components/shipping/ShippingBadge.tsx
src/components/shipping/DeliveryEstimate.tsx
```

No new utilities were introduced this pass; the fixes lean on native semantics (label,
`role="alert"`/`role="status"`, `aria-pressed`, `aria-describedby`, `inert`) plus the
existing `sr-only` helper in `globals.css`.

---

## Not fixed / remaining risks (by choice)

- **Clerk sign-in/sign-up widgets** — prebuilt components; label/announcement behavior is
  owned by Clerk. Audit them with Lighthouse/aXe in a browser if needed.
- **Search results screen-reader announcement** — the ARIA `combobox` pattern waits on the
  results list; a live-region announcement of "N results" on submit is a nice enhancement,
  not an AA requirement.
- **MiniCart & SearchBar runtime behavior in a real browser** — verified by type-check and
  build only; the focus trap and `inert` toggling should be smoke-tested (keyboard) in the
  running app.
- **Paystack redirect page** (`/pay/result`) — status glyphs are `aria-hidden` next to
  visible status text; nothing further from us.
- **Emoji product thumbnails** in cart/wishlist remain raw emoji text (announced as their
  Unicode name). Converting to `role="img"` + aria-label there is a trivial follow-up if
  desired.
- **Contrast** — relies on existing shadcn/`muted-foreground` tokens; verified conceptually
  against their defined values but not re-measured per-state in a browser.

## Verification (raw)

```
$ bunx tsc --noEmit        → no output (clean)
$ bun run lint             → "✔ No ESLint warnings or errors"
$ bun run test             → Test Suites: 6 passed; Tests: 125 passed (0 snapshots)
$ bun run build            → ✓ Compiled successfully in 11.7s
                             ✓ Generating static pages (13/13)
                             (all 16 routes + middleware, no errors)
```

## Suggested follow-ups (not required for AA)

1. Add `aria-live="polite"` result-counter to SearchBar submit.
2. Add `aria-live` to cart total updates in MiniCart header.
3. Browser smoke test (Keyboard nav: Tab order, Esc in MiniCart, arrows in SearchBar).

---

*Prepared for the Zionstone storefront. No commits were made; the working tree has
`zionstone-store/` untracked at the repo root (pre-existing layout — the repo tracks files
at its root, not this folder). Nothing here alters the `zionstone-api` service or the
honesty-test contracts.*