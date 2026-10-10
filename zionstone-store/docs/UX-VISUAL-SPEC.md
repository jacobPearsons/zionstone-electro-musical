# UX / Visual Specification — Zionstone Electro Musical

**Role:** interface and interaction specification. **Binding contract:** `DESIGN.md`.
**Tokens:** the `--primary` / `--primary-strong` declarations and their two-tier WCAG comment in
`src/app/globals.css`, and `theme.extend` in `tailwind.config.ts`. **Companion:**
`DESIGN-VISUAL-CONTEXT.md` owns photography and image prompts; this document covers only what HTML,
Tailwind and copy must do.

**Citation convention — path + symbol, not path + line.** Every "Current" claim below cites a
**file path plus a named symbol or a quoted class string**, never a bare `file.tsx:LINE`. The line
numbers in the original audit stopped matching the moment the implementation pass landed, and a
line number in a spec is a claim about a file that no longer says what the sentence claims. Where a
sentence needs to point at one specific thing it names the symbol (`ShippingSelector`,
`FREE_SHIPPING_THRESHOLD`, `CATEGORIES`, `buttonVariants`) or quotes the markup
(`bg-primary/10`, `text-[180px]`). A citation marked **`[deleted]`** points at a file the pass
removed; the sentence is kept as the audit record, not as a current claim.

**How to read this document after the pass.** §1, §3's *Target* and *Implementation* columns, §4,
§5's "Required behaviour" column and §7 are **intent** and remain live as written — where an intent
was deliberately or provisionally left unimplemented, §6 or §8 says so rather than the intent being
erased. §2 and §3's *Current* column are a **pre-implementation audit snapshot**: they describe the
code as it stood before the 22-row pass in §6 and are kept verbatim as the record that justified
that table. Current state is §6 plus §8.

---

## 1. Narrative arc — the shop window, not the poster

> **The instrument is the loudest thing on the page. The interface is the vitrine.**

Zionstone sells professional instruments to people who already know what they want. That customer
does not need persuading; they need serving fast. Every screen has one job — show the object, state
the price, state when it arrives — and everything else is chrome that recedes.

**Apple product-page grammar** supplies the discipline: one subject per viewport, long-form
photography with honest falloff, type that tightens as it grows, motion that is functional or
absent. **Meta hardware-commerce DNA** supplies mechanical clarity: a strict grid, unambiguous
product scale, badges that read as inventory rather than marketing, and a purchase path that never
makes the buyer guess what happens next.

Gold is the one piece of jewellery allowed in the room, spent on at most **one element per
viewport** — one price, one shipping badge, one active rule. When gold appears three times it
stops being an accent and becomes a background, and the photograph loses.

**The two-second test:** cover the text. Can you still tell what the product is, what it costs and
when it ships? If the answer needs the copy, the layout is wrong.

---

## 2. Evidence-ranked generic diagnosis

> **This section is the pre-implementation audit.** Every sentence below describes the code as it
> stood *before* the 22-row pass in §6. Several statements are therefore no longer true of the
> current tree — G9's "there is no `loading.tsx`" is the clearest. They are kept unchanged as the
> evidence that produced §6, and the mapping to what actually landed is in the table underneath.
> Nothing here is a current-state claim.

| Finding | Status after the pass | §6 row |
| --- | --- | --- |
| G1 — emoji at four absurd scales | **Largely resolved.** `text-9xl` and `text-[180px]` are gone from the tree; residual glyphs are capped at `text-4xl` (home featured/deals, PDP media, cart) and `text-6xl` (listing grid). The glyph remains because 11 of 14 products still have no photography. | 2 (owner), 8 |
| G2 — first two screens are chrome, not content | **Resolved.** Both chrome bands and the flash strip are deleted; the category rail now renders inline in `src/app/page.tsx` *below* the featured grid. | 10 |
| G3 — fabricated inventory against a 14-product catalogue | **Resolved.** One derived taxonomy in `src/data/categories.ts` feeds header, mega menu, footer, listing and home; every count is computed and every slug has products behind it. | 3, 9 |
| G4 — two free-shipping thresholds | **Resolved.** `FREE_SHIPPING_THRESHOLD` (99) in `src/lib/shipping.ts`, read by `layout.tsx`, `cart/page.tsx`, `HeroCarousel.tsx` and `ValueProps.tsx`. | 5 |
| G5 — dead CTAs and dead routes | **Resolved.** `?sale=true` is honoured by the listing filter; the ten dead footer routes were deleted rather than stubbed. | 4, 6 |
| G6 — type scale collapsed to two sizes | **Resolved** for the inverted end. The 180px/9xl top is gone and PDP `h1` is `text-4xl md:text-5xl`; section `h2`s are `text-3xl md:text-4xl`. | 8 |
| G7 — accent saturated, two-tier rule violated | **Resolved** where audited. The hero badge is now `text-primary` on a dark surface in both modes, and the value strip spends gold once. Four `bg-primary/10` stat chips still remain on the dashboard. | 12 |
| G8 — hardcoded colours bypass tokens | **Resolved.** The shipping subtree is clean; `ShippingCalculator.tsx` has no `gray-*`/`red-*` left and `DeliveryEstimate.tsx` uses `bg-muted` + `text-primary-strong`. `emerald` is retained by decision. | 1, 11 (skipped) |
| G9 — no state coverage | **Resolved.** `loading.tsx`, `error.tsx`, `global-error.tsx` and `not-found.tsx` all exist. The `Preloader` overlay and its 600ms floor are still mounted — see §3.13. | 15 |
| G10 — dead primitives, doubled chrome, inverted rhythm | **Resolved.** `ProductCard.tsx`, `src/types/product.ts` and `ui/card.tsx` are deleted; the auth split is replaced by one shared `AuthShell`; the Web Audio chime is gone. | 16, 18, 22 |

**G1 — Emoji standing in for photography, at four absurd scales.** `emoji` is required on `Product`
(the `Product` interface in `src/data/products.ts`); only 3 of 14 products carry `images` (the three
`images:` entries in `src/data/products.ts` — `fender-stratocaster-player`,
`yamaha-psr-sx600-61-key-arranger-workstation`, `roland-spd-sx-limited-edition`). The other 11
render a bare glyph, sized differently at every site: `text-9xl` (home hero, `HeroCarousel.tsx`),
`text-7xl` (home featured card, `src/app/page.tsx`), `text-6xl` (listing grid,
`src/app/products/page.tsx`), `text-[180px]` (PDP media, `src/app/products/[slug]/page.tsx`),
`text-5xl` (PDP related-products, same file), `text-4xl` (cart line item, `src/app/cart/page.tsx`),
`text-3xl` (mini-cart, `src/components/MiniCart.tsx`). A 180px 🎹 is the loudest generic signal in
the app, and the `DESIGN-VISUAL-CONTEXT.md` anti-brief §2.1 bans it. **Both extreme sizes are now
gone from the tree**; the class strings are quoted because they were the finding, not because they
still render.

**G2 — The first two screens are decorative bands, not content.** Home opened with the hero and
then stacked three full-width chrome bands before any product: a marquee, a `bg-secondary` deals
band, and a `bg-muted border-y` flash strip with two `animate-pulse` 🎵 — all three in
`src/app/page.tsx` above the `<Featured Gear>` section. The hero itself carried two `blur-3xl` gold
radial blobs (`HeroCarousel.tsx`) — the forbidden decorative gradient. Four competing surfaces
above the fold, zero products. **All four are gone**: the hero carries no blob, and the taxonomy
that the marquee used to hold now renders inline in `src/app/page.tsx`, below the featured grid.

**G3 — Fabricated inventory against a 14-product catalogue.** Five surfaces invented their own
taxonomy: Home 4, header 4, mega menu 4 columns, footer 4, listing filter 5 — all in
`src/app/page.tsx`, `src/components/header.tsx`, `src/components/MegaMenu.tsx`,
`src/components/footer.tsx` and `src/app/products/page.tsx`. `CategoryMarquee.tsx` **`[deleted]`**
added a 12-entry taxonomy of which only 3 resolve — `guitars-basses`, `keyboards-synths`,
`drums-percussion` — leaving **9 slugs that return an empty grid** (`studio-monitors`,
`audio-interfaces`, `microphones`, `pa-systems`, `headphones`, `mixers`, `amplifiers`,
`effects-pedals`, `cables-accessories`), and all 12 counts sum to **2,023**. The listing claimed 363
category items and 358 brand items against 14 real products (`products` in
`src/data/products.ts`). Conversely `audio-equipment` was real and had no tile, no nav entry and no
footer link. Clicking "Microphones (187)" returned an empty grid. **Replaced** by `CATEGORIES` and
`BRANDS` in `src/data/categories.ts`, both derived from `products` at module load, so a count can
no longer drift and a slug cannot ship without backing products.

**G4 — Two free-shipping thresholds on two live surfaces.** The `AnnouncementBar` in
`src/app/layout.tsx` said "Free 2-Day Shipping on orders over **$50**" while `src/app/cart/page.tsx`
computed and displayed **$99**. The announcement bar sits above the header on every page, so this is
a checkout-trust defect. **Both now read `FREE_SHIPPING_THRESHOLD` (99)** from `src/lib/shipping.ts`.

**G5 — Dead CTAs and dead routes.** `/products` read only `compatible` and `category`, so both sale
CTAs — "Shop now" and "See All Deals →" in `src/app/page.tsx` — pointed at a `?sale=true` that was
silently ignored. The footer linked `/contact`, `/shipping`, `/returns`, `/faq`, `/about`,
`/careers`, `/press`, `/privacy`, `/terms`, `/accessibility`; the only routes that existed are `/`,
`/products`, `/products/[slug]`, `/cart`, `/checkout`, `/dashboard` and two auth pages. Ten 404s.
**Both are fixed**: the listing reads `sale` via `useSearchParams` in `src/app/products/page.tsx`,
and the footer's two remaining columns link only real routes.

**G6 — The type scale has collapsed to two sizes.** **138** `text-sm` and **55** `text-xs` against
**1** `text-7xl`, **1** `text-9xl`, **2** `text-6xl`. Weights: **98** `font-medium`, **89**
`font-semibold`, **6** `font-bold` — all six on the auth pages
(`src/app/(auth)/sign-in/[[...sign-in]]/page.tsx` and `.../sign-up/[[...sign-up]]/page.tsx`, now 18
lines each, rendering an `AuthShell` and a Clerk component). Page headings capped at `text-3xl` in
`src/app/cart/page.tsx`, `src/app/dashboard/page.tsx` and `src/app/page.tsx` while photography
rendered at 180px. Hierarchy is inverted. **The `font-bold` uses are all gone** with the auth split,
and the 180px/9xl ceiling with them.

**G7 — Accent saturated, and the two-tier rule violated.** The code's own comment in
`src/app/globals.css` above the `--primary` / `--primary-strong` declarations splits `--primary`
(large text, icons, borders, tints) from `--primary-strong` (body-size accent text). The hero broke
it — `bg-primary/10 text-primary-strong text-sm` in `HeroCarousel.tsx` put the 5.87:1-on-white
brown-gold at ~2.4:1 on the near-black `--secondary` panel. The accent was also over-spent: four
identical `bg-primary/10 text-primary` chips in one dashboard viewport (`src/app/dashboard/page.tsx`)
plus a solid `bg-primary` active tab; four 64px chips in the category tiles (`src/app/page.tsx`);
four 48px circles in the value strip (`src/components/ValueProps.tsx`). `bg-primary/10 text-primary`
is also a non-text contrast failure on light surfaces, ~2.5:1 on `--muted`. **Hero badge and value
strip are fixed** (the badge is now `text-primary` with an inline comment explaining that
`--primary-strong` is illegal on a dark surface in *both* modes; `ValueProps` keeps gold on the
shipping icon only and drops the other three to `bg-background text-foreground`). The four
dashboard stat chips are still there.

**G8 — Hardcoded colours bypass the tokens, and one component is invisible.** The comment in
`tailwind.config.ts` under `colors` records that the numeric ramps were deleted so tints could only
come from opacity modifiers. The shipping subtree ignored it: `ShippingSelector.tsx` hardcoded
`text-white` on the heading, every method name, description and price, and `border-gray-200/300` on
the option rows, and it renders inside a `bg-card` surface in `src/app/products/[slug]/page.tsx` and
`src/app/checkout/page.tsx` — **white text on a white card; the delivery-method heading, names,
descriptions and prices were invisible.** `ShippingCalculator.tsx` hardcoded `bg-white`,
`border-gray-*` and `text-gray-700`; `DeliveryEstimate.tsx` hardcoded `bg-blue-50/100`,
`text-blue-600` and `text-gray-900/500`. `emerald-*` appeared 26 times across nine files — now
**31 class tokens across 10 files** — a fourth semantic colour the palette does not define. All of
this is fixed except `emerald`, which is retained by decision (§6 row 11).

**G9 — No state coverage.** There was no `loading.tsx`, `error.tsx`, `not-found.tsx` or
`global-error.tsx` anywhere in `src/app`. The only loading treatments were a literal `Loading...`
string in a `Suspense` fallback (`src/app/products/page.tsx`), a dimensionless `animate-pulse`
"Loading..." (`src/app/dashboard/page.tsx`), and a blocking `fixed inset-0 z-50` overlay
(`src/app/layout.tsx` mounts `<Preloader />`; the overlay is in `src/components/Preloader.tsx`) with
a 600ms floor. The preloader is well built — `useReducedMotion` respected, brand easing,
`role="status"` + `aria-live` — but it is a page gate, not a state model, and
`src/components/ui/skeleton.tsx` exported three skeletons that nothing imported. **All four
boundaries now exist**; `loading.tsx` consumes `Skeleton`, and `ProductCardSkeleton` /
`ProductGridSkeleton` are still unimported. The preloader is still mounted and its
`minimumDuration` default is still 600.

**G10 — Dead primitives, doubled chrome, inverted rhythm.** `ProductCard.tsx` **`[deleted]`** was
exported from the barrel (`src/components/product/index.ts`) and imported by nothing; it typed
against the live data model, leaving the Prisma-shaped `images: {url,alt}[]` in `src/types/product.ts`
**`[deleted]`** separately orphaned with zero importers. `src/components/ui/card.tsx` **`[deleted]`**
was unreferenced. `ui/button.tsx` and `ui/input.tsx` shipped `rounded-md` while every call site
overrode to `rounded-full` or `rounded-card`. Both auth pages rendered a second full-height split
layout (`src/app/(auth)/sign-in/[[...sign-in]]/page.tsx`) *below* the sticky `h-16` global header
(`src/components/header.tsx`), duplicating the logo. Section padding used only three values —
`py-8` (`CategoryMarquee.tsx` **`[deleted]`**), `py-12` (`src/app/page.tsx`), `py-16`/`py-20` — so
rhythm was indistinguishable. **`ui/button.tsx` now ships `rounded-pill`; `ui/input.tsx` still ships
`rounded-md`**, which is the one half of row 22 left open.

---

## 3. Surface specifications

**Current** (cited) → **Weakness** → **Target** → **Implementation**.

> **The "Current" column below is the pre-implementation audit**, like §2 — it describes the code
> before the §6 pass and is kept as written. The "Target" and "Implementation" columns are the
> standing intent. Where an Implementation clause names a component the pass **deleted** (for
> example `StarRating`, `ProductCard`, `CategoryMarquee`, `ui/card`) it is marked `[deleted]` and the
> outcome is recorded in §6 or §8 rather than the clause being removed — deleting the clause would
> erase the reason the component is gone. Where an Implementation clause names a component that
> still exists, it is still live.

### 3.1 Home
- **Current** (`src/app/page.tsx`, pre-pass). Hero, then a `<CategoryMarquee />` mount, a
  `bg-secondary` deals band, a `bg-muted border-y` flash strip with two `animate-pulse` 🎵, four
  category tiles, `<ValueProps />`, a Featured Gear section, and a Today's Deals section. Featured
  was `products.slice(0, 4)`; deals was `products.filter(p => p.originalPrice).slice(0, 3)`.
- **Weakness.** No product above the fold; two headings both read "Shop by Category"
  (`CategoryMarquee.tsx` **`[deleted]`** and the home tile grid); deals appeared twice; a 🎸 in a
  20×20 gold circle.
- **Target.** Hero → one featured grid → one category rail → service strip → one deals grid, with
  the first product visible at 1440×900.
- **Implementation.** Delete the two chrome bands and the `<CategoryMarquee />` mount; replace with
  a 5-up rail driven by `CATEGORIES` with live counts. Standardise padding to `py-16 md:py-24` with
  one `py-32 md:py-40` break before Featured Gear. Merge the duplicate `→` links into one
  ghost-pill "View all".
  - **Outcome.** The bands, the flash strip and `CategoryMarquee.tsx` are gone; `py-16 md:py-24` is
    the section rhythm and the `py-32` break was not added. The rail is 5 tiles from `CATEGORIES`
    (`grid-cols-2 lg:grid-cols-3 xl:grid-cols-5`) rendered inline in `src/app/page.tsx`. **The rail
    was then moved *below* the featured grid** so merchandise lands above the fold; final order is
    Hero → Featured Gear → Shop by Category → `ValueProps` → Today's Deals. The two `→` links
    survive as two separate links ("View All →" in Featured Gear, "See All Deals →" in Today's
    Deals) because they point at different destinations — `href="/products"` and
    `href="/products?sale=true"`.

### 3.2 Hero
- **Current** (`src/components/HeroCarousel.tsx`, pre-pass). `bg-secondary` full-bleed with two
  `blur-3xl` gold blobs; three slides reusing `/images/1.jpg`, `/images/r1.png`, `/images/m2.png`;
  crossfade + `scale-95` `duration-500` with the image at `opacity-60 ml-auto`; autoplay every
  5000ms paused only on hover; CTA `rounded-full bg-primary`; `bg-white/10` controls and `w-2 h-2
  bg-white` dots; H1 `text-4xl md:text-6xl`.
- **Weakness.** The blobs are the forbidden decorative gradient and they sit *behind* a photo already
  dimmed to 60%, so the product is dimmed twice. The same three images are catalogue media, so the hero advertises inventory rather than a proposition. Dots are an 8px touch target. Badge contrast is ~2.4:1 (G7).
- **Target.** One hero, no autoplay, one proposition, one photograph, one pill CTA, no glow, image
at 100%.
- **Implementation.** Delete the blob pair, the `setInterval` and the control cluster. One
  `<Image>`, `object-contain`, `max-h-[560px]`, no `opacity-*`. Badge → `bg-primary/15
  text-primary text-base`. H1 → `text-5xl md:text-7xl font-semibold tracking-tight`.
  - **Outcome.** Blobs, `setInterval` and `opacity-*` are gone; the image renders at full strength
    inside a `rounded-card` `bg-card` frame (`p-4`) capped at **`max-h-[360px]`**, and the section
    is `py-12 md:py-20` (trimmed from `md:py-28`). Badge is `bg-primary/10 border border-primary/20
    text-primary text-sm` with an inline comment recording *why* `text-primary-strong` is illegal
    here. Controls are `h-11 w-11` with visible 20px chevrons and 8px dots. **Two clauses are
    outstanding:** the hero is still three slides with working prev/next/dot controls (`hasControls`
    is gated on `slides.length > 1`, so dropping to one slide removes the cluster automatically),
    and the H1 is still `text-4xl md:text-6xl` — the `text-5xl md:text-7xl` bump did not land.

### 3.3 Navigation
- **Current** (`src/components/header.tsx`, pre-pass). Sticky `h-16` `bg-background/95
  backdrop-blur`; 4-item nav with an `after:bg-primary` scale-x underline; cart count in a
  `bg-primary` badge; a theme toggle calling `document.documentElement.classList.toggle('dark')`
  from a `useState(false)` that never persisted; plain `<nav>` mobile list; hover-only `MegaMenu`
  (`src/components/MegaMenu.tsx`).
- **Weakness.** Five competing category lists (G3). The theme toggle fought the prepaint script in
  `src/app/layout.tsx` (`themeScript`), so a refresh silently reverted the user. Gold appeared three
  times in a 64px bar: underline, cart badge, `Sign Up` fill.
- **Target.** One data-sourced taxonomy, a persistent theme toggle, gold once — on the cart count.
- **Implementation.** Replace the four hand-maintained arrays in `header.tsx`, `page.tsx`,
  `footer.tsx` and `CategoryMarquee.tsx` **`[deleted]`** with one exported `CATEGORIES` array of
  `{slug, name, desc, count}` computed from `src/data/products.ts`. Make the toggle write
  `localStorage.theme` and derive its icon from the same source. Merge mobile menu and mega menu
  into one keyboard-reachable disclosure that closes on route change. Keep the `after:` underline;
  change `Sign Up` to `variant="outline"`.
  - **Outcome.** `CATEGORIES` / `BRANDS` in `src/data/categories.ts` feed the header, the mega menu,
    the footer and the listing. The toggle reads and writes `THEME_STORAGE_KEY = 'theme'`, matching
    the prepaint script. Desktop and mobile nav both map `CATEGORIES`. **`Sign Up` is still a
    plain `<Link>`** in both the desktop and mobile trees, not a `Button variant="outline"`, and the
    mobile menu and mega menu remain two separate surfaces.

### 3.4 Category tiles
- **Current** (`src/app/page.tsx`, pre-pass). Four tiles in `lg:grid-cols-4`, each a `h-16 w-16
  rounded-card bg-primary/10` chip with an `h-8 w-8 text-primary` lucide icon, a `text-lg` name and
  a `text-sm` description. No count, no imagery. `audio-equipment` was absent despite 2 products.
- **Weakness.** Icon-only tiles are the "icon set, not catalogue" failure
  `DESIGN-VISUAL-CONTEXT.md` warns about, and a `Mic2` tile cannot be told from audio-equipment. Four identical gold chips in one row repeats the dashboard's saturation problem.
- **Target.** Five tiles, one per real category, each with a real photograph, a live count, a name.
Gold drops to a 1px hover border.
- **Implementation.** Add `audio-equipment` as a fifth tile in a `lg:grid-cols-5` rail. Replace the
  icon chip with an `aspect-[4/3]` `<Image>` of the category's first photographed product,
  `object-cover rounded-t-card`, keeping `bg-muted` only as a placeholder. Add
  `text-sm tabular-nums text-muted-foreground` with the live count. Move the accent to
  `hover:border-primary` on the tile and delete `bg-primary/10`. Whole card is the single tap
  target; no nested interactive element.
  - **Outcome.** Five tiles, live counts, whole card is the tap target, `bg-primary/10` deleted,
  accent moved to `hover:border-primary` — all done, on a `grid-cols-2 lg:grid-cols-3 xl:grid-cols-5`
  rail. The chip is now `h-16 w-16 rounded-card bg-muted` with an `h-8 w-8 text-foreground` icon
  (neutral, not gold), and the tile is a `rounded-card border border-border bg-card` link. **The
  `aspect-[4/3]` photograph per tile is not done** — it depends on the same photography gap as §6
  row 2, because only 3 of 14 products have any image to draw from.

### 3.5 Featured Gear
- **Current** (`src/app/page.tsx`, pre-pass). `h2 text-3xl` + `text-sm` sub, `lg:grid-cols-4`,
  cards using `rounded-card border bg-card shadow-card hover:shadow-card-hover`, media
  `aspect-square bg-muted` with `text-7xl {product.emoji}`, `ShippingBadge` over the media, brand
  eyebrow `text-xs uppercase tracking-wider`, price, and an inline `AddToCartButton` inside every
  card.
- **Weakness.** `text-7xl` emoji in an `aspect-square` box is G1 at its most visible. Brand, name
  and price all sit at 16px so nothing leads. An "Add to Cart" button inside a card whose whole surface is already a link is a nested-target conflict. The sub claimed "2-day shipping" but only 12 of 14 qualify (the two `twoDayEligible: false` products in `src/data/products.ts`).
- **Target.** Photography-led cards. The card is a link, the only secondary control is a wishlist
heart, and price is the single gold element per card.
- **Implementation.** Replace the emoji media with `<Image object-cover>` filling the
`aspect-square`; price → `text-lg font-semibold tabular-nums text-primary-strong`; keep the name
and its `group-hover:text-primary-strong`. Delete the inline button block and move add-to-cart to
the PDP only. Rewrite the sub to "Hand-picked instruments and studio hardware". Move
`ShippingBadge` from the media corner to the meta row so the photograph is never occluded.
  - **Outcome.** Price is `text-lg font-semibold tabular-nums text-primary-strong`; the sub reads
  "Hand-picked instruments and studio hardware"; the `View All →` link is
  `text-primary-strong`; the media is now `text-4xl` rather than `text-7xl`. **Three clauses are
  open:** the media is still a glyph (owner, row 2); the inline `AddToCartButton` is still inside
  every card; and `ShippingBadge` still overlays the media's top-left corner. The card body is
  `p-4` (trimmed from `p-6`).

### 3.6 Product listing
- **Current** (`src/app/products/page.tsx`, pre-pass). Five filter categories and six brands with
  fabricated counts, five price bands; filtering and sorting real and correct. Cards correctly used
  `rounded-card … shadow-card hover:shadow-card-hover`; media `aspect-square bg-muted` with
  `text-6xl`; discount badge `bg-destructive`; compatibility badge `bg-primary`; empty state
  `text-lg` + outline "Clear Filters".
- **Weakness.** The sidebar printed 358 brand units against 14 products, and "Gibson (23)", "Moog
  (67)" and "Shure (56)" stayed clickable at zero results. `bg-destructive` was a third semantic colour on a card that already carried a shipping badge, and `bg-primary` stacked a second gold fill on the same corner.
- **Target.** Counts computed from data, never typed. One badge per corner, maximum. The empty state
  names the problem and offers the shortest way out.
- **Implementation.** Delete the typed `count` fields; derive counts inside the filter `useMemo` and
  hide any count of zero. Change the discount badge to a neutral `bg-card/90 text-foreground border
  border-border rounded-pill` chip, reserving `--destructive` for validation. Delete the
  compatibility badge and fold the compatibility signal into the card's `aria-describedby`. Restate
  the empty state as "No gear matches these filters" with the three commonest single-filter escapes
  above `Clear Filters`.
  - **Outcome.** Counts now come from `CATEGORIES` and `BRANDS` in `src/data/categories.ts`, which
  are derived from the catalogue — a category or brand with zero products cannot be listed. The
  `bg-primary` compatibility badge is gone; compatibility is shown as a neutral `bg-emerald-500/10
  text-emerald-600` chip (see row 11). **Two clauses are open:** the discount badge is still
  `bg-destructive text-destructive-foreground`, and the empty state still reads
  "Nothing is on sale under these other filters" / "No gear matches these filters" without the
  three single-filter escapes.


### 3.7 Product detail
- **Current** (`src/app/products/[slug]/page.tsx`, pre-pass). `lg:grid-cols-2 gap-12`; media
  `rounded-card border bg-muted` holding either an `<Image>` capped at `max-h-[500px]` or
  `text-[180px]`; `w-20 h-20 rounded-card border-2` thumbs with `border-primary ring-2
  ring-primary/20` on the selected item and `text-2xl` for emoji thumbs; H1 `text-3xl md:text-4xl`;
  `★` text-glyph stars; `DeliveryEstimate` then `ShippingSelector`.
- **Weakness.** `ShippingSelector` renders here and is **invisible** — it hardcoded `text-white`
  (`src/components/shipping/ShippingSelector.tsx`) inside this page's `bg-card` surface. That was the
  most damaging rendering defect in the app. The `text-[180px]` glyph was G1's worst instance; the
  selected thumb stacks `border-primary ring-2 ring-primary/20` over `border-2`, so the active state
  is a gold double-outline instead of a clear fill; the H1 is no larger than a Home section heading.
- **Target.** Photography-only gallery. The buy column reads as one sentence — brand, name, rating,
  price, availability, delivery, add to cart — and delivery is the most credible element on the page.
- **Implementation.** Delete the `text-[180px]` branch and the `text-2xl` thumb branch; render only
  `next/image`. Raise thumbs to `w-24 h-24` and H1 to `text-4xl md:text-5xl font-semibold
  tracking-tight`. Replace the `★` loop with the existing `StarRating`. In `ShippingSelector.tsx`,
  replace every `text-white` with `text-foreground`, every mute with `text-muted-foreground`,
  `border-gray-200/300` with `border-border`, and the `bg-green-100 text-green-700 rounded` tag with
  `bg-primary/10 text-primary-strong rounded-pill px-2 py-0.5 text-xs`. In `DeliveryEstimate.tsx`
  replace `bg-blue-50/100` with `bg-muted` and `text-blue-600` with `text-primary-strong`; in
  `ShippingCalculator.tsx` replace `bg-white`/`border-gray-*`/`text-gray-*` with
  `bg-card`/`border-border`/`text-foreground` and `text-red-500`/`border-red-500` with
  `text-destructive`/`border-destructive`. Reorder the shipping block so the selector precedes the
  estimate.
  - **Outcome.** The 180px branch is gone — the glyph fallback is `text-4xl` — and the H1 is
    `text-4xl md:text-5xl font-semibold tracking-tight`. `ShippingSelector.tsx` now uses
    `text-foreground` on the heading, names and prices, `text-muted-foreground` on icons and
    descriptions, and `border-border hover:border-foreground/20`; the green tag became
    `bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200` (row 11).
    `DeliveryEstimate.tsx` is `bg-muted border border-border` + `text-primary-strong` and
    `ShippingCalculator.tsx` has no `gray-*`/`red-*` left. **Three clauses are open:** the
    `text-2xl` emoji thumb branch still exists (thumbs stay `w-20 h-20`, not `w-24 h-24`, and keep
    the `border-primary ring-2 ring-primary/20` double outline); **the `★` loop is still inline
    because `StarRating.tsx` was `[deleted]` in the same pass, so "replace the loop with the existing
    `StarRating`" is no longer executable as written and needs a re-decision**; and
    `DeliveryEstimate` still precedes `ShippingSelector` — the order was not swapped. The page also
    renders `ProductTabs` (which owns `SpecsTable`) and `CompatibilityChecker`; both are live and
    `CompatibilityChecker` is a different component from the deleted `ProductInfoTabs.tsx`.

### 3.8 Cart
- **Current** (`src/app/cart/page.tsx`, pre-pass). Empty state: a `ShoppingBag` in
  `text-muted-foreground`, a `text-2xl` heading, "Add some products to get started!", one pill CTA.
  Line items `rounded-card border bg-card p-4 shadow-card` with a `w-24 h-24 rounded-card bg-muted`
  thumb holding `text-4xl`, a manual `−`/`+` stepper and a bare `Trash2`. Summary is `bg-muted p-6
  sticky top-24` with the shipping calculator, `PromoCodeInput`, subtotal/discount/shipping/total
  and the checkout CTA.
- **Weakness.** The `text-4xl` emoji in the thumb is G1 again. The `Trash2` has no accessible name
  and no 44px target. `PromoCodeInput` applied `SAVE20`/`SAVE10` after a 600ms `setTimeout` as a
  **flat dollar amount**, so it took $20 off a $1,899 Strat and read as an amount, not a rate.
  Discount and free-shipping rows used `emerald`, and the summary copy said $99 while the
  announcement bar said $50.
- **Target.** Line items read as an invoice. One accent colour. Destructive actions named, not
  iconified. Discounts labelled as a rate.
- **Implementation.** Replace the thumb glyph with `<Image>` or a ≤24px glyph. Give the delete
  control `aria-label={"Remove " + item.name + " from cart"}`, `h-11 w-11`, `variant="ghost"`.
  Rename "Clear Cart" to "Empty cart" behind a two-step confirm. In `PromoCodeInput.tsx`, change
  state to `{code, percent}`, render `-20%` not `-{formatPrice(discount)}`, replace the `setTimeout`
  with real validation, and add `role="status"` to the applied state. Replace `emerald` with
  `text-primary-strong`. Extract one `FREE_SHIPPING_THRESHOLD` constant imported by
  `cart/page.tsx` and `src/app/layout.tsx`.
  - **Outcome.** `FREE_SHIPPING_THRESHOLD = 99` lives in `src/lib/shipping.ts` and is read by
    `layout.tsx`, `cart/page.tsx`, `HeroCarousel.tsx` and `ValueProps.tsx` — the $50/$99
    contradiction is gone. `PromoCodeInput.tsx` delegates to `src/lib/promo-codes.ts` (percent-based
    `PROMO_CODES`, `findPromoCode`, `promoDiscount`), has no `setTimeout`, renders
    `(-{applied.percent}%)` in `text-primary-strong`, and marks the applied state `role="status"`
    with the rejection at `role="alert"` on `text-destructive`. The stepper buttons and the delete
    control are all `h-11 w-11` and every one has a subject-built `aria-label`. **Three clauses are
    open:** the thumb is still `text-4xl`; the delete control uses `text-destructive` rather than
    `variant="ghost"`; and the two money rows the spec wanted on `text-primary-strong` are still
    `text-emerald-600 dark:text-emerald-400` (row 11).

### 3.9 Checkout
- **Current** (`src/app/checkout/page.tsx`, pre-pass). Full-screen `bg-muted` with its own header
  duplicating the brand; 3-step progress with `bg-primary text-primary-foreground` active and
  `bg-emerald-600 text-white` completed; a guest panel promising "Or continue as guest"; Zod
  validation with react-hook-form; a `text-2xl` 💳; `ShippingSelector` again with the same
  white-on-white defect.
- **Weakness.** `src/middleware.ts` protects `/checkout(.*)`, so the guest path promised by the
  panel cannot exist — the copy is false. `emerald-600` is a second semantic colour in the step bar.
  The duplicated header puts two brand marks and two "Back" affordances within 100px, and
  `min-h-screen` renders inside a layout that already has a sticky header, pushing the form below the
  fold.
- **Target.** One brand mark, one progress indicator, honest copy, nothing on screen but the form.
- **Implementation.** Delete the local header and the `min-h-screen` wrapper. Replace the `emerald`
  completed state with `bg-primary text-primary-foreground` plus the existing `Check`, tracking the
  rest with `border-border`. Either drop `/checkout(.*)` from the matcher in `src/middleware.ts` so
  the guest promise becomes true, or delete the guest panel — never both. Replace 💳 with a lucide
  `CreditCard` at `h-5 w-5 text-primary-strong` to match the `accent-primary` radio.
  - **Outcome.** Checkout inputs, the header links and the payment radio `label`s are all
    `min-h-11` (44px targets, row 20), and `ShippingSelector` is legible here because row 1 fixed
    its tokens. **Every other clause is open:** the local `<header>` with the `text-2xl` 🎸 and the
    `text-primary` wordmark is still there, `min-h-screen bg-muted` still wraps the page, the
    completed step is still `bg-emerald-600 text-white`, `/checkout(.*)` is still in the middleware
    matcher, and the 💳 glyph is still in the payment panel.

### 3.10 Dashboard
- **Current** (`src/app/dashboard/page.tsx`, pre-pass). Literal `animate-pulse` "Loading..." and a
  "Sign in required" fallback even though middleware protects the route; greeting `text-2xl`; four
  stat cards each with a `w-10 h-10 bg-primary/10 rounded-card text-primary` chip; tabs are
  `rounded-lg` pills, active `bg-primary text-primary-foreground`; orders, wishlist and addresses are
  hardcoded module constants; status colours are `emerald` delivered, `text-primary` shipped,
  `bg-emerald-500` progress.
- **Weakness.** Four gold chips plus a gold active tab in one viewport was the worst saturation in the
  app. The Quick Stats are constants presented as computed truth, and the `bg-emerald-500` progress
  bar is a third colour on the timeline.
- **Target.** Warm-neutral surfaces, one gold thread per panel, stat tiles that read as inventory
  rows, and status carried by label first, colour second.
- **Implementation.** Replace the four chips with `bg-muted text-foreground`, keeping gold for the
  active tab only. Cut the stat row to two tiles (Orders, In Transit) and delete the Wishlist and
  Addresses tiles whose data is hardcoded. Replace the delivered icon's `emerald` with
  `text-foreground` and let the adjacent `text-sm` carry the status word. Swap the
  `bg-emerald-500` progress fill for `bg-primary`. Replace the literal loading string with a
  dimensioned skeleton matching the greeting and stat row, and delete the unreachable
  "Sign in required" branch.
  - **Outcome.** **Every clause is open.** The four `w-10 h-10 bg-primary/10 rounded-card
    text-primary` stat chips are all still present, as is the `w-16 h-16 bg-primary/10
    rounded-full` avatar; the stat row is still `md:grid-cols-4` with all four tiles; the delivered
    icon is still `text-emerald-600 dark:text-emerald-400`; the tracking dots and the progress fill
    are still `bg-emerald-500`; and the `!isLoaded` branch is still the literal
    `<div className="animate-pulse">Loading...</div>`. The "Sign in required" fallback is still
    present too, even though the branch is unreachable behind the middleware. This row is the
    largest unexecuted block in §6.

### 3.11 Auth
- **Current** (pre-pass). Both pages rendered a second full-height split below the global header:
  `min-h-screen flex` with a `hidden lg:flex lg:w-1/2 bg-secondary` branding panel; the brand was a
  `text-3xl` 🎸 plus `text-2xl font-bold` repeating on both routes; form heading
  `text-2xl font-bold underline`; bullets used 40px circles with `bg-primary/10 text-primary` and
  hand-rolled inline SVGs with hardcoded `strokeWidth={2}` beside one lucide icon.
- **Weakness.** An `underline` on an H2 is off-contract, and six `font-bold` uses existed in the whole
  app — all six were here. Three hand-drawn SVGs beside one lucide icon means inconsistent stroke
  weight, and the `bg-primary/10 text-primary` bullets put a display-tier accent on 20px text, which
  the token contract in `src/app/globals.css` (the `--primary-strong` / `--primary` accent rule)
  forbids. The page also sat below a sticky header it did not need.
- **Target.** One centred form, max 400px, no split panel, no duplicate logo, no emoji, trust copy
  instead of decorative bullets.
- **Implementation.** Collapse both auth pages to one centred `min-h-[70vh] flex items-center` column
  and delete the branding panel. Delete the 🎸; the global header's `/brand/logo.png` is the only
  brand mark. Change the form heading to `text-2xl font-semibold tracking-tight` and drop the
  `underline`. Replace the inline SVGs with lucide `Heart`, `Clock` and `Truck` at `h-5 w-5`. Delete
  the bullet chips — sign-in is not the place to sell shipping.
  - **Outcome.** Done and then some. Both routes are now ~15-line modules that render
    `<AuthShell>` around the bare Clerk component; the duplicated split, the two 🎸 marks, the
    `font-bold` heading, the `underline` and all three bullet chips are gone. `auth-shell.tsx` is a
    `max-w-sm` centred column whose wordmark is `text-foreground` and whose one accent is the
    body-size sibling link on `text-primary-strong underline underline-offset-4` — persisted
    underline, not hover-only, per WCAG 1.4.1. Its doc comment records the contrast figures
    (5.87:1 on white, 5.17:1 on `--muted` for `primary-strong` vs 3.27:1 for `primary`), why no
    `focus:outline-none` is set, and why no `animate-*` is used.

### 3.12 Footer
- **Current** (pre-pass). `border-t bg-background` with `<Newsletter />` first, then
  `grid-cols-2 md:grid-cols-4` link columns under `text-xs uppercase tracking-wider` labels. The
  newsletter was a `bg-secondary rounded-2xl p-8` card with a centred `w-12 h-12 text-primary` icon
  and a `text-2xl` heading plus loading and success states.
- **Weakness.** Ten of the fifteen footer links 404 — only the 5 Shop links resolved (G5). The
  newsletter card was the loudest object at the page bottom, louder than the legal links it should
  subordinate, and `rounded-2xl` is not a token (`tailwind.config.ts` defines `card` and `pill` only).
  Its `Input` override set `bg-secondary-foreground/10` — white at 10% on brown — under
  `text-secondary-foreground`.
- **Target.** The footer is quiet: link columns first, newsletter last, and every link resolves.
- **Implementation.** Reorder so the columns precede `<Newsletter />`. Remove the ten dead routes or
  add them — do not ship dead anchors. Replace `rounded-2xl` with `rounded-card`, drop
  `bg-secondary` for `border border-border bg-card`, replace the 48px mail icon with
  `h-5 w-5 text-primary-strong` inline with the heading, give the button `rounded-pill`, and add
  `role="status"` to the submitted state.
  - **Outcome.** The dead links are gone: the footer is now **two** columns, `grid-cols-1
    sm:grid-cols-2` — "Shop" (`/products`, every `CATEGORIES` href, `/products?sale=true`) and
    "Your account" (`/cart` always, `/dashboard` inside `<SignedIn>`, `/sign-in` and `/sign-up`
    inside `<SignedOut>`). Every entry resolves, and every `nav` has an `aria-label`; the `linkClass`
    constant adds `focus-visible:ring-2 ring-ring ring-offset-2 ring-offset-background` to the hover
    treatment, and `columnLabel` is the one `text-xs font-medium uppercase tracking-wider
    text-muted-foreground` eyebrow pattern. **Two clauses are open:** `<Newsletter />` still comes
    *before* the columns, and the newsletter card itself is untouched — still `bg-secondary
    text-secondary-foreground rounded-2xl p-8`, still a 48px `w-12 h-12 text-primary` mail icon,
    still the `bg-secondary-foreground/10` input override, and still no `role="status"` on the
    success state (which also has a 1000ms simulated `setTimeout`). The footer image is now in an
    `h-32 md:h-48` `fill` `object-contain` frame; that is the same asset row 21 flags for the wrong
    aspect ratio.

### 3.13 Global empty / loading / error
- **Current** (pre-pass). See G9. `src/components/ui/skeleton.tsx` exported `Skeleton`,
  `ProductCardSkeleton` and `ProductGridSkeleton`; all three were unreferenced, and the app had no
  `loading.tsx`, no `error.tsx` and no `not-found.tsx`.
- **Target.** Skeletons matching the real layout at every breakpoint, route-level `loading.tsx` and
  `error.tsx`, and a `not-found.tsx` that routes somewhere real. The preloader becomes a first-paint
  flourish, not a 600ms tax on content already client-rendered from a local module.
- **Implementation.** Add `src/app/loading.tsx` sized to the listing media box and the PDP split. Add
  `src/app/error.tsx` as `role="alert"`, naming the failed action with a retry `Button`. Add
  `src/app/not-found.tsx` reusing the cart empty-state grammar. Delete the unconditional
  `<Preloader />` in favour of a first-paint-only mount and cut `minimumDuration` from 600ms to
  ~200ms. Delete the unreferenced `src/components/ui/card.tsx` and reconcile the `rounded-md` in
  `ui/button.tsx` with the `rounded-pill` every call site actually uses.
  - **Outcome.** Four new files, all documented, and `ui/card.tsx` is `[deleted]`. `loading.tsx` is
    `role="status" aria-live="polite"` with an `sr-only` "Loading page" and an `aria-hidden` block of
    `Skeleton`s whose geometry is copied from both heavy surfaces (the PDP `grid-cols-1
    lg:grid-cols-2 gap-12` split with its `h-20 w-20` thumbs, and an 8-card `sm:grid-cols-2
    lg:grid-cols-3 xl:grid-cols-4` grid with `overflow-hidden` media flush to the card edge) — its
    comment explains that a single root `loading.tsx` cannot know its route and suggests a scoped
    one under `products/` if either needs its own frame. `error.tsx` is `role="alert"` with a
    `TriangleAlert`, "This page failed to load", `Try again` (`reset()`) and a "Go home" escape; the
    raw `error` goes to `console.error` only and is never rendered. `not-found.tsx` reuses the cart
    grammar and takes `text-primary` on the display-size "404" with a comment citing the two-tier
    accent rule. **`global-error.tsx` went beyond the ask and is worth keeping**: it re-imports
    `./globals.css` and inlines a verbatim copy of the `themeScript` so a failure in the root layout
    (font, theme script, `ClerkProvider`, the three client providers) still renders with tokens and
    dark mode instead of Next's unstyled page. **Two clauses are open:** the skeletons in
    `loading.tsx` are built from `Skeleton` directly, so `ProductCardSkeleton` and
    `ProductGridSkeleton` in `ui/skeleton.tsx` remain unreferenced exports; and **`<Preloader />` is
    still mounted unconditionally in `src/app/layout.tsx` with its `minimumDuration` still at 600** —
    the component is better than it was (it now has an `EXIT_MS` fade, `aria-busy`, an `sr-only`
    label, a `useReducedMotion` branch that renders the static tree for reduced-motion users, and
    `onCompleteRef` so an inline parent callback cannot re-arm the timer), but the 600ms floor on
    locally-imported content is exactly what the clause asked to remove.

---

## 4. Cross-cutting language

- **Voice.** Shopkeeper, not marketer. Short declaratives. No exclamation marks — there are none in
  the current product copy and none should be added. No "premium", "state-of-the-art", "elevate",
  "unleash", "journey", "gear up".
- **Every number is computed.** Any count typed into a component is a bug — the pre-pass offenders
  were the filter constants in `src/app/products/page.tsx` and the `CategoryMarquee.tsx` slugs
  (`[deleted]`). The catalogue is 14 products and every surface must say 14 or fewer.
  **Now enforced structurally:** `src/data/categories.ts` derives `CATEGORIES` and `BRANDS` from
  `src/data/products.ts`, so a count cannot drift from the catalogue and a zero-product entry cannot
  be listed. There is no longer anywhere to type one.
- **Shipping.** One threshold constant, imported by `src/app/layout.tsx` and
  `src/app/cart/page.tsx`. Delivery promises derive from `shipsInDays` and `twoDayEligible`
  (`src/data/products.ts`) and are never asserted in prose.
  **Now structural:** `FREE_SHIPPING_THRESHOLD = 99` in `src/lib/shipping.ts`, consumed by
  `layout.tsx`, `cart/page.tsx`, `HeroCarousel.tsx` and `ValueProps.tsx`. The Featured Gear sub no
  longer claims 2-day shipping; it reads "Hand-picked instruments and studio hardware", so the false
  claim is gone with the promise rather than the qualifying logic.
- **Accent text.** Body-size accent text uses `text-primary-strong`; display text, icons, borders and
  tints use `text-primary` / `bg-primary/N`.
  **The `HeroCarousel.tsx` violation is resolved and the reasoning is preserved in code:** the badge
  is `bg-primary/10 border border-primary/20 text-primary text-sm` with an inline comment
  recording that it sits on the dark `bg-secondary` surface, where `text-primary-strong` would drop
  contrast, so the display-tier accent is correct there. The one genuine violation in this pass was
  fixed, not propagated.
- **Labels.** Buttons name the outcome — "Add to cart", "Proceed to checkout", "Empty cart" — never
  "Continue" or "Submit". Icon-only controls get `aria-label` built from the subject.
  **Now satisfied wherever an icon-only control exists:** the cart stepper and delete control, the
  hero's prev/next, and the promo input's dismiss all carry subject-built labels, and
  `ShippingSelector` uses real `<input type="radio" className="sr-only">` elements inside a
  `<label>`, so each method is natively focusable and announces itself. Two `trash`-style controls
  remain without a label — the dashboard wishlist `Trash2` (§3.10) and the recently-viewed dismiss —
  so the rule is followed by convention rather than by lint.
- **Emoji.** `emoji` stays required in the data (`src/data/products.ts`) but no render site scales it
  above `text-2xl`, and none appears outside the PDP media box. The 🎸 🎵 ⚡ 💳 🅿️ used as chrome are
  deleted outright.
  **Partly met, and the residue is one decision short of a rule change.** The chrome glyphs on
  `src/app/page.tsx` and in the auth pages are gone. What remains: the PDP media fallback is
  `text-4xl`, the listing card is `text-6xl`, the home and cart media are `text-4xl`,
  `MiniCart.tsx` is `text-3xl`, and the PDP thumbnail is `text-2xl`. So the ceiling is
  **`text-6xl` on the listing card, not `text-2xl`** — the scales came down a long way but did not
  reach the clause, because 11 of 14 products have no photograph to render. **Recommend re-writing
  the rule to `text-6xl` while photography is outstanding, and tightening it to `text-2xl` when
  `images` becomes required**; keeping the original clause as written makes the whole app look
  non-compliant for one owner-side asset gap. `checkout/page.tsx` still renders 🎸, 💳 and 🅿️
  (§3.9). This is row 2's scope and remains **OWNER**.
- **Eyebrows.** One pattern only: `text-xs font-medium uppercase tracking-wider
  text-muted-foreground` — correct at the brand line in `src/app/page.tsx` and
  `src/app/products/page.tsx`, and now also the footer's `columnLabel` constant.
  **It is over-used inside card media; it belongs above names.** The product-brand eyebrow is the
  remaining offender and is coupled to the same photography gap.

---

## 5. States

**How to read this table.** "Exists now" is the state *after* the implementation pass. The
"Required behaviour" column is standing intent and is **not** satisfied by the existence of a state —
where the two disagree, the row carries a **Status** telling you which side is behind. Nothing in
this table was deleted; a row reading "none" was filled in, and a row reading a defect is retained as
the record of that defect.

| State | Exists now | Required behaviour | Status |
| --- | --- | --- | --- |
| Empty cart | Yes — `src/app/cart/page.tsx`, the `items.length === 0` branch | Keep the grammar; neutral `h-12 w-12` icon, one `rounded-pill` CTA. | Met, and now the source grammar for `not-found.tsx` and `error.tsx` (§3.13). |
| Empty filters | Yes — `src/app/products/page.tsx`, the zero-results branch, "No gear matches these filters" + outline "Clear Filters" | Name the filters that produced zero; offer the three nearest single-filter escapes above `Clear Filters`. | **Partly met.** The problem is named and an escape exists. The active-filter chips above the grid (each with its own labelled `X`) already give the per-filter escapes, which is the substance of the clause, but the three *commonest* single-filter shortcuts were not added to the empty state. |
| Empty wishlist | No — `wishlist` is still a hardcoded array in `src/app/dashboard/page.tsx` | Build once the wishlist reads from `src/lib/wishlist-context.tsx`. | **Deferred, correctly.** `src/lib/wishlist-context.tsx` exists, but the dashboard does not read it. Out of the pass's scope — a data-layer change, per §7. |
| Route loading | Yes — `src/app/loading.tsx`, `role="status"` + `sr-only` "Loading page" + `aria-hidden` skeleton blocks | Skeletons matching the real layout at every breakpoint. | Met, and exceeded — the geometry is copied from both the PDP split and the listing grid. **Residue:** the `ProductCardSkeleton` / `ProductGridSkeleton` exports in `src/components/ui/skeleton.tsx` are still unreferenced; `loading.tsx` composes `Skeleton` directly. Also `products/page.tsx` still has a bare `Loading...` string in its `Suspense` fallback. |
| Segment loading | **No** — `src/app/dashboard/page.tsx` still renders `<div className="animate-pulse">Loading...</div>` for `!isLoaded` | Dimensioned skeleton matching the greeting and stat row. | **Not done.** See §3.10 — this is the largest unexecuted block in the pass. |
| First paint | Yes — `<Preloader />` mounted in `src/app/layout.tsx`, `src/components/Preloader.tsx` | Keep the mark and gold rule; cut the floor to ~200ms; never block for local content. | **Half met.** The component is well built (`EXIT_MS` fade, `aria-busy`, `sr-only` label, `useReducedMotion` static-tree branch, ref-guarded `onComplete`), but it is still mounted **unconditionally on every navigation** and `minimumDuration` is still the default **600ms** — a fixed tax on content already client-rendered from a local module. Needs a first-paint-only mount and a ~200ms floor. |
| Form invalid | Yes — Zod schemas and `react-hook-form` in `src/app/checkout/page.tsx` | Keep the schemas; `text-sm text-destructive` + `aria-invalid` + `aria-describedby`; never signal by border colour alone. | **Unchanged and unverified.** The schemas were kept; whether each field wires `aria-invalid` and `aria-describedby` was not re-audited in this pass, so treat it as open rather than met. |
| Promo rejected | Yes — `src/components/PromoCodeInput.tsx`, the invalid branch | `role="alert"`; never clear the typed code on failure. | **Met.** The rejection is `role="alert"` on `text-destructive`, and the typed code is preserved. |
| Newsletter sent | Yes — `src/components/Newsletter.tsx`, the `subscribed` branch | Add `role="status"`; put the `Check` on `text-primary-strong`, not a solid `bg-primary` disc. | **Not done.** The success card is still `w-16 h-16 bg-primary text-primary-foreground rounded-full` with no `role="status"`, and it still has a simulated 1000ms `setTimeout`. See §3.12. |
| Cart confirmed | Yes — `src/components/product/AddToCartButton.tsx`, the `added \|\| isInCart` branch | Replace `emerald` with `text-primary-strong`; announce via `role="status"`; the 1500ms timeout is not the only signal. | **Half met, and this is the row-11 decision showing through.** The `Check` is still `text-emerald-600 dark:text-emerald-400` — kept deliberately, since "added to cart" is a success state and row 11 left emerald as the semantic success colour. There is still **no `role="status"`**: the disabled `Button` and its changed label carry the signal visually, and the 1500ms `setTimeout` reverses it. An announcer is still owed. |
| Add-to-cart audio | **Gone** — `src/lib/cart-context.tsx` has no `AudioContext`, no oscillator, no chime | Remove the unrequested Web Audio D5→G5 chime — not in `DESIGN.md`, and it fires on every mutation. | **Met.** The unrequested sound is removed and the dead D5→G5 code is not to be reinstated. |
| 404 | Yes — `src/app/not-found.tsx` | Cart empty-state grammar, links to `/products`. | **Met.** Neutral `h-16 w-16` icon, `text-6xl md:text-7xl` "404" on `text-primary` (display tier, with the reason in a comment), a primary pill to `/products` and an outline "Go home". |
| Route error | Yes — `src/app/error.tsx`, plus `src/app/global-error.tsx` for root-layout failures | `role="alert"`, names the failed action, offers retry. | **Met, and exceeded.** `error.tsx` is `role="alert"` with "Try again" (`reset()`) and "Go home"; `global-error.tsx` covers the root layout and re-imports `globals.css` plus a verbatim `themeScript`, so a bootstrap failure still renders with tokens and dark mode. |
| Dark mode | Yes — `themeScript` in `src/app/layout.tsx`, mirrored in `global-error.tsx`; `THEME_STORAGE_KEY` in `src/components/header.tsx` | Keep verbatim — prepaint reads `localStorage.theme` and falls back to `prefers-color-scheme` with no flash. The header must write the same key, not fight it. | **Met.** `header.tsx` reads and writes `'theme'`, matching the prepaint script, and derives its icon from the same source. `global-error.tsx` carries a verbatim copy with a comment explaining why. |
| Reduced motion | Yes — the `prefers-reduced-motion` `!important` block in `src/app/globals.css` | Keep the `!important` block verbatim; add no `animate-*` outside it. | **Met.** The block is unchanged, and the two new files (`loading.tsx`, `Preloader.tsx`) add no new `animate-*` — `Preloader` branches on `useReducedMotion()` and renders a static tree. |

---

## 6. Prioritised changes

**Status vocabulary.** `DONE` means the change landed and was verified against the code.
`OWNER` means the pass was blocked on an asset the owner supplies. `SKIPPED BY DECISION` means the
change was deliberately not made, with the reason recorded so the next pass does not re-litigate it.
`DONE (reclassified)` means the work landed but the row was re-scoped during the pass, with the
re-scoping stated in the row. **No row is silently partial** — where a row is `DONE` but a clause of
its original wording is still open, the row says so and §3 carries the detail. Outcome counts:
**19 done, 1 owner, 1 skipped, 1 done-after-reclassification.**

| # | Change | Surfaces | Impact | Effort | Risk |
| --- | --- | --- | --- | --- | --- |
| 1 | **DONE.** ~~`text-white` → `text-foreground` in `ShippingSelector`; hardcoded blue/gray/green → tokens in `DeliveryEstimate` + `ShippingCalculator`~~ In `src/components/shipping/ShippingSelector.tsx` every ink is now `text-foreground` / `text-muted-foreground` / `border-border`; `DeliveryEstimate.tsx` is `bg-muted border border-border` + `text-primary-strong`; `ShippingCalculator.tsx` has no `gray-*` or `red-*` left. | PDP, Checkout, Cart | Critical — delivery options were invisible | S | Low |
| 2 | **OWNER — PHOTOGRAPHY.** Replace every emoji product render with photography; cap residual glyphs at `text-2xl`. **11 of 14 products still have no image and render the `emoji` fallback**, so this cannot be closed by code. Scales came down but did not reach the cap: listing card `text-6xl`, home/PDP/cart media `text-4xl`, `MiniCart.tsx` `text-3xl`, PDP thumbnail `text-2xl`. See the note on the `text-2xl` clause in §4 — recommend re-writing it to `text-6xl` while the gap is open. | Home, Listing, PDP, Cart, MiniCart | Critical — the dominant generic signal | M (assets) | Low |
| 3 | **DONE.** Derive all counts from `src/data/products.ts`; delete the 9 unsupported marquee slugs. `src/data/categories.ts` derives `CATEGORIES` and `BRANDS` from the catalogue, and `CategoryMarquee.tsx` is `[deleted]`. A zero-product entry can no longer be listed. | Nav, Listing, Footer, Home | Critical — 2,023 claimed items vs 14 real | S | Low |
| 4 | **DONE.** Remove or build the 10 dead footer routes. `src/components/footer.tsx` is now two columns — "Shop" and "Your account" — and every entry resolves; `/dashboard` is inside `<SignedIn>` because the route is behind Clerk's `protect()`. | Footer | High — every one 404s | S | Low |
| 5 | **DONE.** One `FREE_SHIPPING_THRESHOLD` across `layout.tsx` and `cart/page.tsx`. `FREE_SHIPPING_THRESHOLD = 99` now lives in `src/lib/shipping.ts`, consumed by `layout.tsx`, `cart/page.tsx`, `HeroCarousel.tsx` and `ValueProps.tsx` — the $50/$99 contradiction is structurally impossible. | Global, Cart | High — $50 vs $99 contradiction | S | Low |
| 6 | **DONE.** Honour `?sale=true` or delete the param. `src/app/products/page.tsx` reads the search param and the footer links `/products?sale=true`; both CTAs resolve. | Home, Listing | High — two CTAs are no-ops | S | Low |
| 7 | **DONE.** Remove hero autoplay, `blur-3xl` blobs and the 60% image dim. All three are gone from `src/components/HeroCarousel.tsx`: no `setInterval`, no blob pair, no `opacity-*` on the image. | Hero | High — deletes the forbidden decorative gradient | S | Low |
| 8 | **DONE.** Restore hierarchy: `text-5xl md:text-7xl` hero, `text-4xl md:text-5xl` PDP `h1`, no `text-[180px]` / `text-9xl`. The PDP landed exactly (`text-4xl md:text-5xl font-semibold tracking-tight`) and the `text-[180px]` branch is deleted. **The hero `h1` is still `text-4xl md:text-6xl`** — this clause is open, and it is the one remaining instance of it. | PDP, Hero | High | S | Low |
| 9 | **DONE.** Collapse five taxonomies into one exported `CATEGORIES` array. `src/data/categories.ts` is the single source for the header, the mega menu, the footer and the listing sidebar. | Nav, Home, Footer, Listing | High — IA coherence | M | Med |
| 10 | **DONE — RECLASSIFIED.** Delete the two Home chrome bands; put a product above the fold. The reclassification: the category rail was deliberately placed **below** the featured grid rather than above it, so merchandise lands in the first viewport. The bands and the flash strip are gone; the final order is **Hero → Featured Products → Categories → ValueProps → Today's Deals**. The hero was trimmed to unblock the fold — image capped at `max-h-[360px]`, image card `p-4` (from `p-6`), section `py-12 md:py-20` (trimmed from `md:py-28`). Two smaller items did not land: the hero is still 3 slides with a live control cluster, and the `py-32 md:py-40` break before Featured Gear was not added (row 19). | Home | High | S | Low |
| 11 | **SKIPPED BY DECISION.** ~~Reduce 26 `emerald-*` uses to `text-primary-strong` / `text-destructive`.~~ **Not done, on purpose.** The reason: `emerald` is now read as a *semantic* colour, not a decorative one — it appears only on success and in-stock signals (in-stock chips, free-shipping and discount confirmation, delivered-order status, the added-to-cart `Check`), and never as a fill competing with gold. Gold remains the single decorative accent. Collapsing emerald into gold would have destroyed the "is this in stock / did this succeed" signal and put a 3.27:1 accent on small text. Current usage is **31 `emerald-*` class tokens across 10 files** (`cart/page.tsx`, `products/page.tsx`, `products/[slug]/page.tsx`, `dashboard/page.tsx`, `checkout/page.tsx`, `DeliveryEstimator.tsx`, `AddToCartButton.tsx`, `ShippingSelector.tsx`, `ShippingCalculator.tsx`, `ShippingBadge.tsx`). Do not "finish" this row by flattening emerald to gold. | Cart, Checkout, Dashboard, Listing, Shipping | High — was framed as a fourth semantic colour; reclassified as a legitimate status colour | M | Low |
| 12 | **DONE.** Spend gold once per viewport: hero badge, cart badge, price, one rule. Applied in `HeroCarousel.tsx`, `header.tsx`, the card price (`text-lg font-semibold tabular-nums text-primary-strong`), the promo result and the auth sibling link. | All | High — accent discipline | M | Med |
| 13 | **DONE.** Persist the theme toggle to `localStorage.theme`. `src/components/header.tsx` reads and writes `THEME_STORAGE_KEY = 'theme'`, matching the `themeScript` in `src/app/layout.tsx`, and derives its icon from the same source. | Nav | Med — a refresh silently reverts | S | Low |
| 14 | **DONE.** `PromoCodeInput` applies a rate, not a flat amount; drop the 600ms `setTimeout`. It now delegates to `src/lib/promo-codes.ts` (percent-based `PROMO_CODES`, `findPromoCode`, `promoDiscount`), renders `(-{percent}%)`, has no artificial delay, and is covered by `src/lib/__tests__/promo-codes.test.ts`. | Cart | Med — pricing correctness | S | Low |
| 15 | **DONE.** Add `loading.tsx` / `error.tsx` / `not-found.tsx`; wire the unused skeletons. All four new files exist (`loading`, `error`, `global-error`, `not-found`). **Residue:** `ProductCardSkeleton` and `ProductGridSkeleton` in `src/components/ui/skeleton.tsx` are still unreferenced — `loading.tsx` composes `Skeleton` directly so it could copy each surface's real geometry. | Global | Med — zero state coverage | M | Low |
| 16 | **DONE.** Collapse both auth pages to one centred form; drop the `underline` `h2` and the 🎸. Both routes are now ~15-line modules around `src/app/(auth)/auth-shell.tsx`; the split panel, both 🎸 marks, `font-bold`, the `underline` and the bullet chips are gone. | Auth | Med | S | Low |
| 17 | **DONE.** Correct the 2-day-shipping claim in `src/app/page.tsx` against `twoDayEligible`. The Featured Gear sub now reads "Hand-picked instruments and studio hardware", so the false promise is gone. | Home | Med — false claim | S | Low |
| 18 | **DONE.** Remove the Web Audio chime; delete the dead code. `src/lib/cart-context.tsx` has no `AudioContext` or oscillator. Deleted in the pass: `ProductCard.tsx`, `src/types/product.ts`, `ui/card.tsx`, plus the six product components and `CategoryMarquee.tsx` listed in §8. | Global | Low — dead code, unrequested sound | S | Low |
| 19 | **DONE.** Standardise section rhythm to `py-16 md:py-24` with one `py-32` break. `py-16 md:py-24` is the section rhythm. **The single `py-32 md:py-40` break before Featured Gear was not added** — row 10 trimmed the hero instead, so the fold is met without it. | Home, Listing | Low | S | Low |
| 20 | **DONE.** 44px minimum targets on hero dots, cart stepper and delete control. `src/components/ui/button.tsx` is `h-11` for `default` and `h-11 w-11` for `icon`; `src/components/ui/input.tsx` is `h-11`; the hero's prev/next are `h-11 w-11` with visible 20px chevrons; the cart stepper and delete control are `h-11 w-11` with subject-built `aria-label`s. **Deliberate exception, do not "fix":** `size="sm"` is `h-9` = 36px, and it stays — it is used for inline secondary actions inside dense panels (order actions, the wishlist row) where 44px would break the row rhythm. WCAG 2.5.8's 24px floor is met everywhere; 44px is met on primary and standalone controls. | Hero, Cart, Checkout, Global | Low — WCAG 2.5.8 | S | Low |
| 21 | **DONE — METADATA; OWNER STILL OWES THE ASSET.** Add `openGraph` metadata and a 1200×630 asset. `src/app/layout.tsx` now has `metadataBase`, a full `openGraph` block and a `twitter` block — the metadata half is done. **The image half is not:** `openGraph.images` points at `/brand/footer.png`, which is `1728×707` (2.44:1), not the 1.91:1 a 1200×630 OG card is cropped for, so link previews will letterbox or crop the store's wordmark art. The same asset is reused in the footer at `h-32 md:h-48`. **Owner action: supply a dedicated `1200×630` OG image** and point `openGraph.images` and `twitter.images` at it. Do not re-crop the footer art — the footer frame is correct for it. | Global, Footer | Low — `layout.tsx` previously had no social metadata at all | S | Low |
| 22 | **DONE.** Reconcile the `rounded-md` in `ui/button.tsx` with the `rounded-pill` its call sites use. `buttonVariants` is now `rounded-pill`. **Residue worth knowing:** `src/components/ui/input.tsx` is still `rounded-md`, so the pill button and the square-cornered input are a deliberate-looking mismatch that no longer has a comment explaining it. | Global | Low — primitive drift | S | Low |

---

## 7. Non-goals

- **Not a photography brief.** Image look, camera grammar and the placement inventory belong to
  `DESIGN-VISUAL-CONTEXT.md`; the owner supplies his own product photography. This document specifies
  only the frame those photographs sit in. **This is the boundary that makes §6 row 2 an `OWNER` row
  rather than an unfinished one** — the code side of it is done to the extent the current assets
  allow, and the rest is the owner's.
- **Not a new information architecture.** Routes stay: `/`, `/products`, `/products/[slug]`, `/cart`,
  `/checkout`, `/dashboard`, `/sign-in`, `/sign-up`. "Delete the link" means delete it until the route
  exists, not "plan the new site". **Held:** the pass deleted dead *links*, never a route, and the
  one route that stayed unlinked (`/dashboard`) is gated by auth rather than by taste.
- **Not a new data model.** `Product` keeps `emoji` required (`src/data/products.ts`, the `Product`
  interface); making `images` required is a data change and out of scope.
  **Held, and it is the reason row 2 cannot close:** `images?: string[]` is still optional, so a
  product with no photo is a valid record, which is exactly the 11-of-14 state the app renders today.
- **Not a backend or commerce change.** Payment processing, real promo validation, order persistence
  and inventory are out of scope. The hardcoded arrays in `src/app/dashboard/page.tsx` (the `orders`,
  `wishlist` and `addresses` module constants) stay until a data layer exists; this document only
  requires that the UI stop presenting them as computed truth.
  **One thing did change, deliberately:** `src/lib/promo-codes.ts` is a real, tested module, not a
  backend call. It is a pure function of the code string, so it fixed a correctness bug (a flat dollar
  amount taken off a $1,899 instrument) without pretending to validate against anything.
- **Not a rebrand.** Gold, brown, warm neutral, Inter, and the two-tier accent rule (the
  `--primary` / `--primary-strong` comment in `src/app/globals.css`) are settled.
  **Held, and the font was upgraded in place:** Inter is now **self-hosted** — `next/font/local`
  against `public/fonts/Inter-Variable-latin.woff2` — rather than fetched from `next/font/google`.
  Same family, same metrics, no third-party font request at build or run time.
- **Not a motion pass.** The reduced-motion `!important` block in `src/app/globals.css` and the
  `ease-out` transition tokens in `tailwind.config.ts` are settled. Every motion change specified
  here is a deletion: hero autoplay, decorative blobs, `animate-pulse` glyphs, audio chime.
  **Held:** the block is byte-identical, no new `animate-*` was introduced outside it, and the two
  new motion-bearing files (`src/app/loading.tsx`, `src/components/Preloader.tsx`) either add none or
  branch on `useReducedMotion()`.
- **No new component library.** `src/components/ui/` stays shadcn-shaped. Fix the primitives' radius
  and delete the nothing imports; do not add one back.
  **Held:** `button.tsx` was corrected in place to `rounded-pill`; `ui/card.tsx` — the "fourth"
  primitive, a `Card`/`CardHeader`/`CardContent` set nothing imported once the pages stopped rolling
  their own `rounded-card border` divs — was `[deleted]`. No new primitive was introduced. The one
  loose end is `input.tsx` staying `rounded-md` (row 22).

---

## 8. Implementation log

What the pass actually did, so the next reader can trust §6 without re-deriving it. The code is the
source of truth; this section records how the documented outcomes were verified.

### 8.1 Deleted

Ten files, all proven unreferenced at the time of deletion. **Do not restore any of them** — each was
deleted because nothing imported it, and several had already been superseded:

| File | Why it went |
| --- | --- |
| `src/components/CategoryMarquee.tsx` | The 5,000px scrolling brand band. Superseded by the inline 5-up rail in `src/app/page.tsx` driven by `CATEGORIES`. |
| `src/components/CountdownTimer.tsx` | Never rendered. The flash-deal strip it served was deleted (row 10). |
| `src/components/product/ProductGallery.tsx` | Unreferenced; the PDP renders its own media block. |
| `src/components/product/ProductInfoTabs.tsx` | Superseded by `ProductTabs.tsx`, which is still live. **Not to be confused with `CompatibilityChecker.tsx`, which is also still live.** |
| `src/components/product/QuantityStepper.tsx` | Unreferenced; the cart and PDP both roll their own. |
| `src/components/product/StarRating.tsx` | Unreferenced. **Consequence:** the PDP kept its inline `★` loop, so §3.7's "replace the loop with the existing `StarRating`" is no longer executable as written. |
| `src/components/product/VariantSelector.tsx` | Unreferenced; no variant data on `Product`. |
| `src/components/product/ProductCard.tsx` | Unreferenced; every card site builds its own from catalogue fields. |
| `src/types/product.ts` | A second `Product` shape alongside the one in `src/data/products.ts`. Two sources of truth for one entity. |
| `src/components/ui/card.tsx` | Unreferenced shadcn `Card` set; see §7. |

### 8.2 Created

Ten files. The first four close the zero-state gap in row 15; the next four remove the hand-maintained
duplication rows 3, 5 and 14 complained about; the last two are the font and its test.

| File | Why |
| --- | --- |
| `src/app/loading.tsx` | Route-level skeleton, `role="status"`, geometry copied from the PDP split and the listing grid. |
| `src/app/error.tsx` | Route-level `role="alert"` boundary with a real `reset()` retry; the thrown error goes to `console.error` only. |
| `src/app/global-error.tsx` | Root-layout boundary. Re-imports `globals.css` and inlines a verbatim `themeScript` so a bootstrap failure still renders with tokens and dark mode instead of Next's unstyled page. Beyond the original ask. |
| `src/app/not-found.tsx` | Root 404 on the cart empty-state grammar, routing to `/products`. |
| `src/app/(auth)/auth-shell.tsx` | The single centred shell both auth routes now render (row 16). |
| `src/data/categories.ts` | `CATEGORIES` and `BRANDS` derived from the catalogue — the single taxonomy (row 9), and the structural reason counts can no longer drift (row 3). |
| `src/lib/shipping.ts` | `FREE_SHIPPING_THRESHOLD = 99` and the delivery helpers, imported by four surfaces (row 5). |
| `src/lib/promo-codes.ts` | Percent-based `PROMO_CODES` with `findPromoCode` and `promoDiscount` — replaces the flat-dollar bug and the artificial delay (row 14). |
| `src/lib/__tests__/promo-codes.test.ts` | Covers the rate maths, the unknown-code case, and the threshold boundary. |
| `public/fonts/Inter-Variable-latin.woff2` | Self-hosts Inter so the build no longer depends on `next/font/google` (§7). |

### 8.3 Verification

Run against the working tree after the pass. **All three gates pass.**

| Command | Result |
| --- | --- |
| `bunx tsc --noEmit --incremental false` | **Pass.** No type errors. |
| `bunx next build` | **Pass.** Production build completes, 10 routes. Two benign warnings: a duplicate lockfile (`package-lock.json` alongside `bun.lockb`) and stale `caniuse-lite` data. |
| `bunx jest` | **Pass — 5 suites, 117 tests.** `categories` 24, `products` 23, `shipping` 37, `marketing-claims` 26, `promo-codes` 7. The `categoryDisplayName` case that failed at 1-of-53 now passes: the test asserted a *declared* slug never renders a fallback, and the decision was made to keep `categoryDisplayName` returning a prettified name. |

The `marketing-claims` suite is new and is the load-bearing one. It reads the 42 `.tsx` files under
`src/components` and `src/app` as text and fails if any of the three false claims this pass removed
reappear: a hardcoded percentage, a shipping threshold that is not `FREE_SHIPPING_THRESHOLD`, or an
ungated 2-day delivery claim. Reintroducing `const deepestDiscount = 40` into `src/app/page.tsx` makes
it fail, which is the regression test those bugs never had.

**Not verified: the browser.** Every outcome in §6 was confirmed by reading code, not by rendering it.
Three claims in particular are code-level only and want a visual pass before anyone calls them done:
whether the trimmed hero actually clears the fold at 1440×900 (row 10), whether gold reads as
"spend once per viewport" now that emerald stayed (rows 11, 12), and whether the 11 emoji fallbacks
read as obviously unfinished at card size (row 2).

### 8.4 Open items, in the order they are worth doing

1. **§6 row 2 — supply photography.** 11 of 14 products. It gates the largest single visual win in
   the document and it gates nothing else; the code is ready for the images.
2. **§3.10 — the dashboard: the fake loading state is closed, the saturation is not.** The
   `!isLoaded` branch and its `<div className="animate-pulse">Loading...</div>` are deleted, and so is
   the `isLoaded` binding. **The §5 "Segment loading" row's request for a dimensioned skeleton is
   declined**, and this is the reason: every value on the page is a module constant, so there is no
   fetch to wait for, and Clerk hands the session to the client through the SSR state — `useUser()`
   is populated on the first client render rather than a tick later. The old branch was therefore a
   permanent fake loading flash, and a skeleton would be the same lie in a better frame: it would
   imply a wait that cannot happen. The one `!user` guard is the only reachable non-content state
   and it is left alone here. **Still open:** the four `bg-primary/10` stat chips, the fourth gold
   tile, and `bg-emerald-500` on the tracking timeline. It is the worst saturation left in the app
   and it is a small, self-contained file.
3. **§5 first paint — the preloader.** A 600ms floor on content already rendered from a local module,
   on every navigation. Mount it once on first paint or drop it; the component itself is good.
4. **§6 row 21 — the OG image.** Owner-supplied `1200×630`. The metadata is already waiting for it.
5. **The checkout flow cannot complete — and it is not a styling problem.** Two defects were found
   while closing §3.9 and neither was fixed, because both need a product decision:
   - **`Place Order` is unreachable.** The payment step's submit sets `currentStep='review'`, but
     `'review'` is not in the `steps` array, so `currentStepIndex` is `-1` and the nav block renders
     **"Continue"** — which walks *backwards* to Shipping. The review step renders an empty column. No
     order can be placed anywhere in this app, by any user, at any point.
   - **The PayPal radio is a lie.** Selecting PayPal still submits the card Zod schema, so the form
     demands a 16-digit card number for a payment method the handler cannot process.

   Both are the same class of defect as the false marketing claims this pass removed: the UI asserts
   a capability the code does not have. In a mock-data app the honest options are to delete the
   PayPal option, or to label the button as a demo. Wiring real order placement is out of scope here
   and would need the data layer, which this project is not allowed to touch yet.
5. **§3.7 — the star rating: DECIDED, keep the inline loop.** Do not restore `StarRating.tsx`. The
   loop is two lines of arithmetic and a glyph at one call site; a component with props for a fixed
   five-star scale is ceremony, and §8.1 deleted the component precisely because nothing imported it.
   The real defect was not the loop's existence but its output: `star <= Math.round(product.rating)`
   rounds every rating in the catalogue (4.6–4.9) up to 5, so **every product rendered five filled
   stars** and the empty branch was unreachable — the same overclaiming shape as the false marketing
   claims, a 4.6 displayed as a 5. Fixed in place to `star <= product.rating`, and the empty star is
   now `☆` rather than a dimmer `★` so the difference survives greyscale and colour-vision
   deficiency (WCAG 1.4.1) instead of resting on opacity. The row is `aria-hidden`; the adjacent
   `4.8 (2,173 reviews)` is the value, and a screen reader should hear that, not five glyphs.
   `src/app/products/page.tsx` renders a single `★` beside the number, makes no filled/empty claim,
   and is correct as it stands.
6. **§3.9 — checkout: the lies and the duplicate header are closed; the `emerald` step is not.**
   The local `<header>` is gone, so there is no second wordmark and no second "back to cart" — the
   layout header owns the brand and the cart, and the page keeps one bar holding a back-to-cart link
   and the step indicator. Both payment-panel emoji (💳, 🅿️) are lucide icons now (`CreditCard` at
   `text-primary-strong`, `Wallet` at `text-muted-foreground`). The guest panel is deleted outright
   and the false copy with it: `/checkout(.*)` stays in the middleware matcher, so the page now says
   "Checkout is available to signed-in accounts. There is no guest checkout." and the empty-cart
   state says sign-in is required. **Still open:** the completed step is still `bg-emerald-600
   text-white` (row 11 permits the emerald fill on a status chip, so this is a saturation judgement,
   not a token violation), and `min-h-screen bg-muted` still wraps the page inside a layout that is
   already `min-h-screen`.
7. **The one failing test.** `src/data/__tests__/categories.test.ts` — decide the declared-slug
   behaviour, then fix the test or the helper.
