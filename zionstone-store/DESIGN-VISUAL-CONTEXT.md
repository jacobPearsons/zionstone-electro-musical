# Design Visual Context — Zionstone Electro Musical

**Role:** visual context for product photography. Binding contract: `DESIGN.md`. Token source of truth: `src/app/globals.css`.

Photography is **supplied by the product owner**, not produced here. This document exists so that
photography you shoot, commission, or source lands correctly in the app: where each image goes, what
aspect ratio and background contract each slot demands, and the lighting grammar that keeps a
14-product catalogue reading as one shoot.

> **Status after the implementation pass.** The lighting grammar (§1–§4) and the checklist (§6) are
> unchanged and still binding — nothing in that pass touched a photograph. §5's placement inventory
> has been re-pointed at the code that exists today: some slots moved, some were deleted, and one
> (`SOC-1`) went from "proposed" to **awaiting the owner's asset**. The current state is unchanged and
> still true: **14 products, 3 with photography, 11 rendering a bare glyph.** Citations are
> path + symbol, not `file.tsx:LINE`. Where a slot's renderer was deleted, the row says
> **`[deleted]`** and points at the live component that replaced it — do not read a `[deleted]` row as
> a slot that still needs an asset.

---

## 1. Narrative spine

> **The light does the selling.**

Zionstone sells professional instruments and studio hardware to people who take their craft seriously, so the catalogue has to behave like a photographic studio, not an icon set. Every product is lit by the same single large soft key from the upper left, sits on the same seamless warm neutral, and is allowed a warm gold bounce from below that ties the photograph to `--primary`. The interface is the vitrine and it recedes: the two-tier gold accent carries at most one badge, one rule, one hover state, and never competes with an instrument. Apple product-page grammar supplies the photography discipline (long lens, honest falloff, no decoration in frame); Meta hardware commerce supplies the mechanical clarity (a strict grid, unambiguous product scale, badges that look like inventory rather than marketing). The intended effect is that a shopkeeper's eye and a player's eye both find the object they want in under two seconds. If a photograph could be dropped into a different brand's catalogue unchanged, it has failed: this is a photographed catalogue, not a mood board.

## 2. What we are NOT (anti-brief)

This applies to every photograph added to the app, whether you shot it, a photographer shot it for you, or you sourced it. Each item is a rejection criterion at review time.

1. **No emoji or flat symbol standing in for an instrument.** A photograph either exists for a slot or the slot keeps its existing glyph fallback.
2. **No flat vector illustration.** No flat-design, no line-art, no isometric vector, no duotone shape composition.
3. **No CGI plastic look.** No turntable render, no soft-shaded toy finish, no plastic sheen, no ambient-occlusion halo, no uniform surface noise. If the specular behaves like a viewport rather than a lens, reject.
4. **No people on catalogue surfaces.** No hands holding, no player at the instrument, no portraits, no silhouettes. People appear only in the editorial lifestyle band (`ED-2`).
5. **No cluttered music-shop backgrounds.** No retail wall, no cable spaghetti, no stacked gear, no sheet music, no amp clutter. The backdrop is empty by contract.
6. **No guitars hanging on a studio wall.** Explicitly banned; the single most common generic music stock-photo failure.
7. **No neon, purple, or magenta.** No `#7C3AED`, no `#A855F7`, no cyan or magenta rim light, no stage-laser colour, no RGB-gaming-hardware glow.
8. **No heavy vignette, film grain, lens flare, or HDR halos.** Flat, even, honest density.
9. **No Dutch angle, no horizon tilt, no motion blur, no shallow-focus bleed on the subject.**
10. **No rendered text in-image, ever.** No brand names, model numbers, spec callouts, prices, watermarks, fake logos, legible serial plates, or legible screen UI. All real text is rendered in HTML. Screens and displays ship dark or faintly lit, never legible.
11. **No busy props** — no cables snaking through frame, no mic stands crossing the subject, no coffee cups, no laptops, no hands in a cut-out.

## 3. Palette mapping

Hexes are the resolved values of the tokens in `src/app/globals.css`, verified against the file. The app renders these as `hsl(var(--token))`; `DESIGN.md` forbids raw hex in application code. Use this table to match a photograph to the surface it will sit on.

| Visual element | Token | Light | Dark | Use in photography |
| --- | --- | --- | --- | --- |
| Seamless light backdrop | `--background` / `--card` | `#FFFFFF` | `#020817` | Cut-outs, PDP detail frames |
| Seamless **media-box** backdrop | `--muted` | `#F3F0ED` | `#1E293B` | **Exact tone match required** for every `bg-muted` slot |
| Dark editorial surface | `--secondary` | `#30201C` | `#422924` | 21:9 band, hero full-bleed, deals band |
| Gold accent / rim light | `--primary` | `#B18748` | `#C69853` | Amber bounce, kicker, warm falloff |
| Gold body text / deep accent | `--primary-strong` | `#7F5F2F` | `#DCB674` | Deepest warm shadow tint, wood-core shadow |
| Ink on gold | `--primary-foreground` | `#201B13` | `#201B13` | Shadow density floor, never pure `#000` |
| Page ink | `--foreground` | `#020817` | `#F8FAFC` | Reference value for maximum ink density |
| Muted neutral | `--muted-foreground` | `#64748B` | `#94A3B8` | Cool bounce, background hardware in editorial |
| Hairline | `--border` | `#E2E8F0` | `#1E293B` | Edge falloff target; note it is **cool** — see below |

**Rules.**

1. **Grade toward `#B18748` / `#7F5F2F`.** All warmth in the frame comes from the gold bounce. Do not introduce off-brand hues: no teal cast, no magenta, no olive green-gold, no blue-white key.
2. **`--border` is a cool slate** (`#E2E8F0`) while the backdrop is warm. Keep backdrop saturation low, within roughly ΔE 4 of `#F3F0ED`, or the media box reads as a colour patch on the card rather than a continuation of it.
3. **Two-tier accent inversion (`DESIGN.md`).** On a dark surface the accent direction flips. `#B18748` disappears against `#020817` / `#30201C`, so dark editorial bands use the **lifted** `#C69853` for any visible warm edge, and `#7F5F2F` is forbidden on dark; the dark-mode strong tier is `#DCB674`. Grade to the tier the surface actually calls for.
4. Shadow floor is `#201B13`-family, never pure black. Pure black against `#F3F0ED` reads as a hole.

## 4. Photography specification

The goal is that all 14 products look like one shoot. Shoot neutral and grade in post, so the catalogue stays consistent as the product line changes. This is the document you hand a photographer: one agreed look for the whole catalogue, settled before the first shot, not a per-image brief.

**Lens and aperture.** **85–120mm equivalent**; reject anything wider than 50mm, because wide-angle foreshortens a body and reads cheap. **f/8–f/11** for full-body frames, focus-stacked, sharp edge to edge. **f/4** only for a designated detail frame where falloff is the point. Editorial and lifestyle frames go to **50mm, f/2.8–f/4** so a frame can hold a person and a room. Camera at subject mid-height, dead level. Subject occupies **70–80% of frame height**, centred, with **at least 8% negative space on every side** so overlay copy and badges never touch hardware.

**Key light.** One large soft source (1.2m softbox or 4ft octabox), **upper-left**, azimuth **45°**, elevation **35–40°**, about **1.5× subject height** away. The only light casting a visible shadow. One large soft source at an angle describes curvature and finish without double specular hotspots; light straight on flattens a body into a silhouette, and a hard source makes chrome look scratched.

**Fill.** **White bounce camera-right**, 1–1.5m from subject, **1 stop under key** (about 3:1 key:fill). 3:1 keeps the shadow side readable while preserving form; 1:1 kills the form, 6:1 makes it a black cut-out.

**Gold bounce (the signature).** One amber bounce card **below and camera-right, 10–15° elevation**, **quarter power**, in the `#B18748` / `#7F5F2F` family. It puts a warm secondary gradient into the underside of a body, the belly of a guitar, or the underside of a mic. This is the one place photography and brand gold meet, and it happens *inside the image*, so the `--primary` accent in the UI reads as the same light rather than as separate decoration.

**Kicker.** One narrow strip box **behind camera-left** skimming the subject's back edge, **1–2 stops over** the key. Black hardware (interfaces, mic bodies, synth panels) vanishes against a mid-tone backdrop without an edge light. Never a glowing outline.

**Backdrop.** Seamless warm neutral, exactly **`--muted` `#F3F0ED`** (light) or **`#1E293B`** (dark), 2.5–3m behind the subject, with a natural gradient to about **12–18% darker** at frame edges. An exact `--muted` match makes the image edge and the CSS media box the same value, so the box disappears; any mismatch is a visible seam rectangle.

**Shadow.** Soft contact shadow directly under the object, **8–12% of frame width**, **1–2 stops** below key, edge falling off smoothly. No hard black ellipse, no long theatrical cast, no floating.

**Colour accuracy (non-negotiable).** Zero colour cast on instrument bodies: a green guitar is green, a sunburst runs amber-to-red-to-black, a natural finish stays pale rather than orange. Matte and diffuse reflections only; a gloss body shows one soft elongated key highlight, never a pinpoint hot spot. Chrome reflects the backdrop, not a blue sky, window grid, or studio ceiling, and reads as a vertical gradient in the same warm neutral. Wood is honest: figure and pore visible, grain running the length of the body, no cartoon banding. No teal-and-orange grade, no lifted blacks on the backdrop.

**Framing for the real slots.** The PDP main image renders with `object-contain` (the media block in
`src/app/products/[slug]/page.tsx`), so the subject must float inside its box with clean margin on all
sides. The listing grid renders with `object-cover` (the card media in `src/app/products/page.tsx`),
which crops hard to a square, so those frames keep the subject inside the central 70% with nothing
important near an edge. A frame that satisfies both: centred subject, generous margin, detail kept
away from the frame edge.

**Category character.** Family resemblance comes from identical key direction, backdrop, and gold
bounce; distinctiveness comes from material and hero angle. Same camera position, different subject
geometry.

- **`guitars-basses`** — warm wood dominant. Key rakes **lower and more grazing** (30° elevation) to
  reveal flame-maple figure and pore as a specular gradient rather than a flat highlight. Hero angle:
  three-quarter body, neck foreshortened out of frame. Rosewood reads near-black-brown, not orange.
- **`keyboards-synths`** — cool control surface. Higher key (50°), tighter framing on the panel so
  knobs, faders, and keybed geometry read as precise repetition. Displays **dark or faintly self-lit
  amber** at 15% brightness or less, never legible, never blue-white. Hero angle: low raking view
  down the keybed so the rows recede.
- **`recording-gear`** — precision metal. Macro-friendly: 100mm, f/8, focus-stacked on a single
  machined feature (knurl, screw, port). Chrome carries a long soft vertical gradient from the same
  warm neutral. Anodised panels stay matte. Hero angle: 3/4 with one port or control in sharp focus.
- **`drums-percussion`** — tension and hardware. Cylindrical forms need a long strip source to draw a
  clean specular line down each shell without breaking it into hotspots. Chrome stands take the
  kicker edge. Mesh heads show weave, not a grey haze. Hero angle: low and centred, kit geometry
  near-symmetric, lugs and tension rods legible.
- **`audio-equipment`** — acoustic warmth, grille texture. Slightly softer key, shallower falloff
  (f/4) so grille cloth and mesh dissolve gently into the backdrop. Foam and fabric read matte with
  visible pore. Hero angle: tight 3/4 on the capsule or grille, body falling into shadow.

## 5. Placement inventory

**The background contract is the load-bearing column.** Slots rendering with `object-contain` expect an **isolated subject on a transparent background** (PNG or WebP with alpha), because the CSS box supplies its own background and an opaque image leaves a rectangular seam. Slots rendering with `object-cover` expect a **seamless flat backdrop** filled with the exact token colour of the box they sit in, because the image edge *is* the visible edge of the media tile. **Getting these backwards is the single most common failure and is visible without opening devtools:** an opaque photo in an `object-contain` slot shows a hard rectangle; a transparent cut-out in an `object-cover` slot shows a tile-coloured square with the subject floating in it.

**The sharpest case is the PDP, in one file.** `PDP-1` and `PDP-2` render the *same* image string under
*opposite* background contracts. The main image is `object-contain` on a `bg-muted` box and needs
alpha; the thumbnail strip is `object-cover` with **no background class on the thumb button**, so the
page background shows through and the thumbnails need a white or near-white flat fill. One asset
cannot satisfy both. Plan two. **Still true, and worth re-reading before you shoot:** this contract
conflict is in the live code and was not resolved by the pass — only the glyph fallback behind it
shrank from `text-[180px]` to `text-4xl`.

Current state, verified against `src/data/products.ts`: **14 products**, 3 with photography (`fender-stratocaster-player`, `yamaha-psr-sx600-61-key-arranger-workstation`, `roland-spd-sx-limited-edition`); the other **11 render a bare glyph**. Existing files in `public/images/`: `1.jpg`–`5.jpg` (Strat), `m1.png`–`m5.png` (PSR-SX600), `r1.png`–`r4.png` (SPD-SX). Reuse them.

Current state, verified against `src/data/products.ts`: **14 products**, 3 with photography (`fender-stratocaster-player`, `yamaha-psr-sx600-61-key-arranger-workstation`, `roland-spd-sx-limited-edition`); the other **11 render a bare glyph**. Existing files in `public/images/`: `1.jpg`–`5.jpg` (Strat), `m1.png`–`m5.png` (PSR-SX600), `r1.png`–`r4.png` (SPD-SX). Reuse them.

| Slot | File that renders it | Aspect ratio | Background contract | Recommended size | Notes |
| --- | --- | --- | --- | --- | --- |
| `HERO-1` carousel right visual | `src/components/HeroCarousel.tsx` | 1:1 | **Transparent (alpha)** | 1024×1024 | `object-contain` inside a `rounded-card bg-card` frame, `p-4`, capped at **`max-h-[360px]`** (trimmed from `max-h-[560px]` to clear the fold). Alpha is mandatory — an opaque image shows a box against the `bg-card` frame. **Still 3 slides**, so supply 1:1 for all three and framing will not jump. `1.jpg` is 372×1137 portrait, which is why the hero framing jumps today; a square crop is the cheapest fix. `hidden lg:block`, desktop only. |
| `HERO-2` full-bleed dark backdrop | `src/components/HeroCarousel.tsx` | 1.78:1 (1672×940) | Dark warm photographic scene behind a `bg-secondary` scrim | 1672×940 | **BUILT, with owner approval.** The hero now carries a full-bleed decorative backdrop — `public/images/hero-golden-hour.webp` (~1672×940, ~1.78:1), an opaque dark warm golden-hour scene — rendered `fill` + `object-cover object-center` with an empty `alt` and `aria-hidden`. A `bg-secondary` scrim keeps the copy AA-legible: mobile uses a near-opaque uniform `bg-secondary/[0.98]` layer (the 14px gold badge drops to 3.67:1 at `/90` and 4.21:1 at `/95` over the scene's amber highlights, so `/98` is the lowest step that holds ≥4.5:1), and md+ uses a left-anchored `from-secondary via-secondary/80 to-secondary/35` gradient so the badge and copy stay on the opaque left. `HERO-1`'s product image still renders on top inside its own `bg-card` frame on `lg+`, and the hero copy remains AA-legible over the scrim. |
| `CAT-1` home category tile media | `src/app/page.tsx`, the "Shop by Category" rail | 4:3 | **Seamless flat** `--muted` `#F3F0ED` | 800×600 | **5 tiles now, not 4** — the rail is built from `CATEGORIES`, so `audio-equipment` is included and every tile has a live count. Still a 64px `h-16 w-16 rounded-card bg-muted` lucide icon (now `text-foreground`, not gold); adding a media band across the top of the tile still needs a small JSX change. |
| `CAT-2` audio-equipment tile | *merged into `CAT-1`* | 4:3 | Seamless flat `--muted` | 800×600 | **Resolved as a separate row.** `audio-equipment` holds 2 products (`ath-m50x`, `yamaha-hs8`) and previously had no home tile while the marquee advertised 12 categories, 8 of them ghost slugs. The rail is now `CATEGORIES`-driven, so all five real categories appear with accurate counts and the ghost slugs are gone with `CategoryMarquee.tsx` **`[deleted]`**. Treat `CAT-1`'s asset as covering five tiles. |
| `CARD-1` product card media | **`[deleted]`** — was `src/components/product/ProductCard.tsx` | 1:1 | **Seamless flat** `--muted` | 800×800 | The component is gone, but the **contract is not**: the identical `aspect-square` + `bg-muted` + `object-cover` box is now inlined at every card site — `src/app/page.tsx` (Featured Gear and Today's Deals), `src/app/products/page.tsx`, and the PDP's related-products and recently-viewed rows. `object-cover` **crops**: keep the subject inside the central 70%. Fallback is a `text-4xl` glyph on home, `text-6xl` on the listing, `text-3xl` in the mini-cart. One 800×800 flat asset serves all of them. |
| `LIST-1` products page grid media | `src/app/products/page.tsx`, the card media block | 1:1 | **Seamless flat** `--muted` | 800×800 | `bg-muted` with `aspect-square`, currently a `text-6xl` glyph — the largest glyph on the site. Centred by `items-center justify-center`, so **centre-weighted framing** matters more here than anywhere else. Same asset as `CARD-1`. |
| `LIST-2` products page list-view thumb | `src/app/products/page.tsx`, the list-view row | 1:1 | Seamless flat `--muted` | 480×480 | `w-48 h-48` in list view. Same asset; a hard crop at this size, so `CARD-1` framing survives both views. |
| `PDP-1` PDP main image | `src/app/products/[slug]/page.tsx`, the main media block | 1:1 | **Transparent (alpha)** | 1200×1200 (rendered 600×600) | `bg-muted` + `aspect-square` + `object-contain` + `max-h-[500px]`, explicit `width`/`height` 600. **Alpha required** so `#F3F0ED` shows through around the instrument. The shipping badge and discount pill overlay the top corners: keep the top 12% of frame clear. Fallback is now a `text-4xl` glyph, down from `text-[180px]`. |
| `PDP-2` PDP thumbnail strip | `src/app/products/[slug]/page.tsx`, the thumb row | 1:1 | **Seamless flat** — on `--background` `#FFFFFF`, *not* `--muted` | 240×240 (rendered 80×80) | 80×80 buttons, `fill` + `object-cover`, **no background class on the button**, so the page background shows through. **Opposite contract from `PDP-1` in the same file.** Active state is `border-primary ring-2`; leave a 6% inner margin. Still `w-20 h-20`, not the `w-24 h-24` §3.7 asked for. |
| `ED-1` editorial band (dark) | *proposed — do not build* | 21:9 | Dark `--secondary` `#30201C` | 2400×1029 | **Superseded.** The pass deliberately deleted the home page's two chrome bands rather than styling them, and the fold is now met by trimming the hero instead. Adding a 21:9 editorial band back would re-break the decision. Verdict: skip. |
| `ED-2` lifestyle band | *proposed — do not build* | 3:2 | Warm environmental, softly out of focus | 1800×1200 | Same reasoning as `ED-1`: the chrome bands are gone by decision, and §2.4's "people only here" rule has no slot to attach to. If a lifestyle band is ever wanted, this is still the right specification. |
| `SOC-1` social / OG image | `src/app/layout.tsx`, the `openGraph` and `twitter` blocks | 1200×630 (1.91:1) | Dark `--secondary` or seamless `--muted` | 1200×630 | **Now wired, and the asset is the one thing blocking it.** `openGraph` and `twitter` metadata landed, but `images` points at `/brand/footer.png`, which is **1728×707 (2.44:1)** — the wrong aspect ratio, so a share card will letterbox or crop the wordmark art. **Owner action: supply a dedicated 1200×630 image** and point both blocks at it. Do not re-crop the footer art; the footer frame is correct for it. Must survive being read as a thumbnail: one instrument, off-centre right, ≥50% negative space left, plate clean. Export PNG — scrapers vary on alpha. |
| `DEAL-1` deals band glyph | *nothing — deleted* | 1:1 | Transparent (alpha) | 256×256 | The `w-20 h-20` circle in `bg-primary/20` and its `text-4xl` 🎸 lived in the home deals band, which is gone. Nothing renders here. **No asset needed.** |
| `CART-1` cart / wishlist thumb | `src/app/cart/page.tsx`, `src/components/MiniCart.tsx`, `src/app/checkout/page.tsx` | 1:1 | Seamless flat | 192×192 | These pass `product.emoji` as the cart `image` string, and `CartItem` requires `image` as a string. **The data-shape blocker in this row is unchanged** — `emoji` is still the value the cart receives — so these rows keep rendering a glyph (`text-4xl` in cart, `text-3xl` in the mini-cart) even for the 3 photographed products. Unifying the shape is a data-layer change, out of the pass's scope. Have the asset ready; expect no visual change yet. |

**Per-product minimum:** 1 × `PDP-1` (alpha, 1200×1200) + 1 × `CARD-1` (flat `#F3F0ED`, 800×800)
+ 3 flat 1:1 variants for `PDP-2` (front three-quarter, detail/macro, full-body profile) = 5 frames
per product, 70 for 14 products. The 3 products that already have photography need only the flat
`#F3F0ED` treatment, not a reshoot. `SOC-1` is one asset, not per-product.

**Naming convention.** `/images/<product-slug>-01.jpg`, `-02`, `-03`, and so on, zero-padded two
digits, files in `public/images/`. Example: `/images/roland-td-17kvx-01.jpg`.

Paths in `src/data/products.ts` **must start with `/`**. The interface is `images?: string[]` (the
`Product` interface), and the PDP branches on `value.startsWith('/')` to choose between
`next/image` and the glyph fallback (the media block in `src/app/products/[slug]/page.tsx`; the
carousel does the same). A relative path like `./images/x.jpg` fails the branch and renders as
literal text. Correct: `images: ["/images/roland-td-17kvx-01.jpg", …]`.

**`emoji` stays required.** It is a non-optional field on every product (the `Product` interface in
`src/data/products.ts`) and is rendered as a text glyph in cart and checkout at `text-2xl` / `text-3xl`
/ `text-4xl` (`src/components/MiniCart.tsx`, `src/app/cart/page.tsx`, `src/app/checkout/page.tsx`). A
product with no photography still needs a valid **single-glyph** value, so the fallback is never a
broken box. **This field did not change in the pass, and it is why 11 of 14 products still render a
glyph** — see §6 row 2 in `docs/UX-VISUAL-SPEC.md`, which is an owner-asset row, not a code row.

**Delivery.** Supply even intrinsic dimensions at roughly 2× the rendered size: the carousel and the
PDP pass explicit `width`/`height`, the cards pass `fill`, and both need 2× density without bloating
LCP. Local paths need no `images.remotePatterns` change.

## 6. Consistency checklist

Run over your own photography before accepting it into the app. Reject and reshoot on first failure.

> Items 7 and 8 still name `ED-1` and `ED-2`, the two editorial slots §5 now marks **do not build**.
> That is deliberate: the constraints are held in reserve, so if an editorial band is ever reinstated
> the grammar is already written. Apply them to those two rows only if the band is actually built.
> Every other numbered item is live and applies to the shipped slots as they stand.

1. **Backdrop is exact** — `#F3F0ED` for `bg-muted` slots, `#FFFFFF` for `PDP-2`, transparent alpha for every `object-contain` slot. No gradient, no texture, no vignette, no visible edge rectangle.
2. **Key is upper-left at 45° / 35–40°** in every frame. Shadow falls lower-right. Reshoot any frame whose shadow points the other way.
3. **No rendered text** — no brand, model, spec, price, watermark, or legible screen UI.
4. **No off-brand hue** — no purple, magenta, neon, teal cast, or stage-laser colour.
5. **Correct aspect ratio and background contract** per the inventory row, with alpha present where required and absent where it is not.
6. **Subject fully in frame** — no clipped headstock, jack, cable end, stand leg, or drum hoop.
7. **Negative space respected** — ≥8% clear on all sides; left 45% on `ED-1`; top 12% on `PDP-1`; left 50% on `SOC-1`; subject inside the central 70% for every `object-cover` slot.
8. **No props, no people** (§2.4, §2.11) — except the permitted player in `ED-2`.
9. **Finish is honest** — no CGI plastic, no pinpoint speculars, no blue sky in chrome, no orange-pushed wood, no pure-black holes in the shadow.
10. **No banned treatment** — no grain, flare, HDR halo, Dutch angle, motion blur, or heavy vignette.
11. **Grade check** — warmth resolves to the `#B18748` / `#7F5F2F` family; on dark bands it is the lifted `#C69853`, never `#7F5F2F`.
12. **Wiring check** — every path starts with `/`, the file is in `public/images/`, and `emoji` remains a single glyph.
