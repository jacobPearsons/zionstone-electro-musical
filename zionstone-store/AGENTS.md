# AGENTS.md — Zionstone Electro Musical

Next.js (App Router) + TypeScript **frontend-only** storefront for musical instruments,
priced entirely in NGN. All dynamic work (upload queue, checkout, shipping) lives in the
separate Express service at `../zionstone-api`; this app calls it cross-origin. Read this
before editing; the honesty tests and the static catalogue are easy to break.

## Commands

```bash
bun run dev          # dev server (local product images, no CDN)
bun run build        # production build — run before final shipping
bun run start        # serve the production build
bun run lint         # next lint (ESLint)
bun run test         # jest (src/**/__tests__/*.test.ts)
bunx tsc --noEmit    # type-check — do this after type-heavy changes
```

There is no local database or Prisma anymore. The storefront talks to the Express API only
through `src/lib/backend-api.ts`, whose base URL is `NEXT_PUBLIC_API_URL` (fallback
`http://localhost:4000`). Point it at the Render URL in production. Never build or modify
`zionstone-api` from here. `package-lock.json` is stale; `bun.lock` is the real lockfile.

## Architecture map

- **App shell** — `src/app/layout.tsx` (Clerk provider, cart/wishlist contexts, header,
  footer, announcement bar). Routes: `/`, `/products`, `/products/[slug]`, `/cart`,
  `/checkout`, `/pay/result`, `/sell`, `/about`, `/categories`, `/contact`,
  `/dashboard/queue`, Clerk `(auth)/sign-in|sign-up`.
- **API client** — `src/lib/backend-api.ts` is the single gateway to `zionstone-api`: typed
  `submitProduct`, `listQueue`, `setQueueStatus`, `getShippingMethods`, `calculateShipping`,
  `initializePaystack`, `verifyPaystack`. It throws a single `ApiError` (with HTTP `status`,
  parsed `data`, and `isRateLimited`/`isUnavailable` helpers) on any non-success envelope,
  and accepts both `{ ok: true }` and `{ success: true }` shapes. Pages must not call
  `fetch('/api/...')` or hardcode the response envelopes.
- **Catalogue (fully static)** — `src/data/products.ts` exports `products =
  [...baseProducts, ...newProducts]`: the legacy demo set plus **60 owner products**
  (`src/data/new-products.ts`, ids `n-01`…`n-60`). `Product` fields: `id, name, brand,
  price?, originalPrice?, currency, category, slug, shipsInDays, twoDayEligible, rating?,
  reviews?, description?, features?, inventory?, images?, specs?, compatibility?`.
  Helpers: `getProductBySlug`, `isOnSale`, `getSaleProducts`, `discountPercent`,
  `maxDiscountPercent`, `getProductsByCategory`, `getRelatedProducts`. `src/data/
  categories.ts` derives `CATEGORIES`/`BRANDS` from the product list.
  **To publish a product: edit the data and rebuild — there is no admin auto-publish.**
- **Currency** — everything is NGN. `src/lib/utils.ts`: `formatPrice(price, currency='NGN')`
  (manual `₦` formatting to avoid server/browser hydration mismatch), `NGN_PER_USD = 1500`,
  `usdToNgn`. `src/lib/shipping.ts`: `FREE_SHIPPING_THRESHOLD = 148_500`,
  `STANDARD_SHIPPING_FALLBACK = 14_985`, methods `8_985` / `19_485` / `37_485`. **Never
  introduce USD pricing.**
- **Paystack checkout** — `/checkout` calls `POST /api/paystack/initialize` on the Express
  API and redirects to the returned `authorizationUrl`; `/pay/result` calls
  `POST /api/paystack/verify`. The API recomputes order totals server-side, so a tampered
  client can only change *which* products, never prices. Without `PAYSTACK_SECRET_KEY` on
  the API, initialize returns **503 "Payment temporarily unavailable"** (surfaced as an
  `ApiError.isUnavailable`). Charges kobo: `toKobo = Math.round(ngn * 100)`.
- **Product upload queue** — `/sell` (react-hook-form + zod, schema in
  `src/lib/submission.ts`) posts multipart to `POST /api/queue/products` on the API (public,
  per-IP rate-limited 5/hr → **429**, image ≤10MB). Admin `GET /api/queue?status=...` and
  `PATCH /api/queue/:id` are Clerk-token protected; `/dashboard/queue` fetches with
  `auth().getToken()` and hands items to the client `QueueList`. **Approving does NOT publish
  to the storefront** — publish is the manual data edit + rebuild above; the dashboard says so.
- **Images** — committed WebP at `public/images/zionstone/<slug>/N.webp`. In production
  served via jsDelivr CDN (`src/lib/images.ts`, `resolveImageSrc`); dev uses local files.
  `next.config.mjs` whitelists `cdn.jsdelivr.net`. Override with
  `NEXT_PUBLIC_PRODUCT_IMAGE_HOST` (origin only, no trailing slash). Queue images come back
  as absolute API URLs, so the dashboard renders them with a plain `<img>`.
- **Promo codes** — `src/lib/promo-codes.ts` (pure; percent-based `SAVE20`/`SAVE10`).
  Applied in cart, persisted in `src/lib/cart-context.tsx` under localStorage `promo_code`,
  and **re-validated server-side** by the API's Paystack init.
- **Styling / motion** — Tailwind with shadcn design tokens (`rounded-card`, `shadow-card`,
  `bg-muted`, `text-muted-foreground`), `cn()` from `src/lib/utils.ts`, `FadeIn` for section
  reveals, lucide icons, sonner toasts, framer-motion.

## Conventions & verification

- **Honesty tests (non-negotiable, keep green)** — `src/lib/__tests__/marketing-claims.test.ts`
  reads `src/components/**` and `src/app/**` `.tsx` as **text** and fails on non-derived
  claims. When editing TSX copy: no bare `NN% off` / `Up to NN%`, no `$`/`₦` money literal
  on a line that mentions shipping, no "2-day" delivery claim without a real
  `twoDayEligible &&` / `twoDayOnly &&` gate within 6 lines, no invented ratings/counts.
  Storewide claims must be derived (`FREE_SHIPPING_THRESHOLD`, `maxDiscountPercent`,
  product `reviews`, etc.). Comments are stripped before scanning, so history in comments
  is fine. Percentages legitimately live in `src/lib/promo-codes.ts` (never scanned).
- **Money math stays server-side** — the Express API recomputes totals in its Paystack
  route; never trust client prices, and never reimplement totals here.
- **Comments that explain WHY are welcome** in this repo — match the surrounding style.
  Don't add comments that just restate the code.
- **Use `cn()`** for class merging and existing tokens/`ui/` components rather than raw
  colors.
- **Auth** — Clerk `auth()` + `auth().getToken()` (server) / `useAuth()` (client).
  `src/middleware.ts` protects `/dashboard(.*)`, `/account(.*)`, `/orders(.*)`,
  `/checkout(.*)`, `/wishlist(.*)`. The API verifies the same Clerk session via Bearer token.
- **Checkout chrome** is intentionally minimal ("Back to cart", no full nav).

## Gotchas

- **Push is slow.** The uplink is ~200 KiB/s; use generous git timeouts (≥420s) or the
  connection drops. No large binaries belong in a normal commit.
- **Remote is SSH**: `git@github.com:jacobPearsons/zionstone-electro-musical.git`. Do **not**
  switch it back to HTTPS — the cached credential token belongs to a different GitHub
  account and gets 403. `gh` CLI is not authenticated.
- **Gitignored**: `brand-assets/` (~270 MB raw PNG source), `/queue/`, `.env`. Never commit
  `queue/` runtime files or `.env`. (`ref/` holds an unrelated sample form; leave it alone.)
- **Shipping estimator is US-ZIP-based** (`calculateShipping`, `ZONE_MAP` is US states)
  despite the Nigerian store — a known mismatch. Relabel/extend carefully; don't hand-type
  delivery thresholds (the marketing test will fail).
- The tests assert exact values: `FREE_SHIPPING_THRESHOLD === 148_500` and
  `maxDiscountPercent() === 21`. Changing either requires updating the catalogue/threshold
  intentionally, not the copy.
