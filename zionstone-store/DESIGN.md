# Zionstone Electro Musical — Design System

## Design DNA

**Apple (primary) + Meta hardware commerce (secondary).**

Apple supplies the governing principle: *photography-first, chrome recedes, one accent colour, no
decorative gradient.* UI furniture must be quieter than the product it frames. Meta supplies the
commerce mechanics that transfer directly from proven hardware retail: pill CTAs, generous card
radii, and a strict three-tier hierarchy that works across home → listing → PDP.

The store sells **premium musical instruments**. Instruments are the content; the interface is the
vitrine. Nothing decorative may compete with a product image.

## Problem being fixed

The current UI reads as generic-AI-generated for three measurable reasons — all confirmed by census,
none of which is a layout problem:

1. **96** hardcoded `yellow-{400,500,600}` palette classes bypass the brand token entirely. Because
   they bypass the token, they cannot follow dark mode and they drift from `--primary`.
2. **13** `purple-*` accents. Purple is shadcn's stock default that was never replaced. It is an
   entirely different hue family from the gold brand and is the single most off-brand thing in the app.
3. **21** arbitrary `bg-gray-50` / `bg-gray-100` light-mode inversions that become near-invisible in
   dark mode because there is no token behind them.

Root cause: `tailwind.config.ts` shipped both a semantic token (`primary.DEFAULT`) **and** a dead
numeric ramp (`primary.500` = `#c99a69`, `primary.600` = `#b18348`) that disagreed with
`--primary` (`hsl(36 42% 49%)` ≈ `#b18748`). Two golds for one brand colour invited the bypass.

## Colour

`--primary` is the **single** source of brand gold. The numeric ramp is deleted.

### Two-tier accent (WCAG)

The brand gold `#b18748` is only **3.27:1 on white** and **2.88:1 on the `--muted` surface**. It
therefore cannot be used for body-size text. There are two accent tokens:

| Token | Light | Dark | Contrast | Use for |
| --- | --- | --- | --- | --- |
| `--primary` | `#b18748` | `#c69853` | 3.27:1 / 7.64:1 | large text (≥24px, or ≥18.66px bold), icons, borders, rings, `bg-primary/10` tints |
| `--primary-strong` | `#7f5f2f` | `#dcb674` | 5.87:1 white, 5.17:1 muted | **body-size text, links, small labels** |

Note the inversion: on the dark canvas "strong" is *lighter*, because contrast against a dark
surface runs the other way.

`--primary-foreground` is **dark ink** (`#1f1a14`), not white — 5.29:1 on the light gold and 6.59:1
on the dark gold, so one value is correct in both modes. White on gold failed in both
(3.27:1 light / 2.07:1 dark). Any `bg-primary` fill therefore carries dark ink, not white.

**Never** use `bg-primary-strong` as a fill behind `text-primary-foreground` — dark ink on
`--primary-strong` is only 2.94:1. `--primary-strong` is a *text on surface* token, not a fill.

| Intent | Use | Never |
| --- | --- | --- |
| Brand accent, large text | `text-primary` | — |
| Brand accent, body-size text / links | `text-primary-strong` | `text-primary` |
| Accent fill carrying text | `bg-primary text-primary-foreground` | `bg-primary text-white` |
| Accent border / ring / selected state | `border-primary`, `ring-primary/20` | — |
| Tinted brand surface | `bg-primary/10` | `bg-yellow-50` |
| Neutral surface | `bg-card` / `bg-muted` | `bg-gray-50` |
| Border | `border-border` | `border-gray-200` |
| Muted text | `text-muted-foreground` | `text-gray-500` |
| Error | `text-destructive` | `text-red-500` |
| Success | `text-emerald-600 dark:text-emerald-400` | — |
| Text on any light surface | `text-foreground` / `text-muted-foreground` | `text-white`, `text-black` |
| Ink on a dark overlay | `text-white` on `bg-black/…` | `text-foreground` |

Opacity modifiers (`primary/10`, `primary/80`) are the sanctioned way to get brand tints. This is
why the numeric ramp is unnecessary.

### Forbidden utilities

These raw palette utilities bypass the token layer and are rejected on sight. They are the *only*
things the token census is run against — when you introduce a colour outside the token system, add
it to this table so the next census catches it.

| Forbidden | Why | Only legal on |
| --- | --- | --- |
| `text-white` | White ink is not a token, so it cannot follow dark mode. In light mode `--card` is `0 0% 100%` (pure white), so `text-white` on `bg-card` is **white-on-white — invisible**. This shipped once already (`ShippingSelector`): the heading, every method name, every description and every price were unreadable in light mode. | A genuinely dark surface only: `bg-secondary` (the auth marketing panel), `bg-primary` (whose ink token is now dark, so prefer `text-primary-foreground`), a `bg-black/…` overlay such as the lightbox, or a solid status fill such as `bg-emerald-600`. |
| `text-black` | The same failure mirrored — black ink vanishes on `bg-background` / `bg-card` in dark mode, where those tokens are `222.2 84% 4.9%`. | A genuinely light surface only, e.g. ink on `bg-primary` → use `text-primary-foreground`. |
| `bg-gray-50` / `bg-gray-100` / `bg-gray-200` | Hardcoded light-mode inversions with no token behind them; they stay near-white in dark mode and silently disappear. | Nowhere. Use `bg-card` / `bg-muted` for surfaces and `border-border` for borders. |
| `bg-yellow-*`, `bg-purple-*`, `bg-pink-500` | Off-brand hue families — shadcn's stock defaults that were never replaced. | Nowhere. Use `bg-primary` with an opacity modifier. |
| `text-gray-*` | Same bypass as `bg-gray-*`, one property over. Shipped in `DeliveryEstimate`. | Nowhere. Use `text-foreground` or `text-muted-foreground`. |
| `border-gray-*` | Hardcoded border that does not invert. Shipped in `ShippingSelector` and `ShippingCalculator`, where a light-gray border stayed light in dark mode. | Nowhere. Use `border-border`; for a hover state use `hover:border-foreground/20`, which inverts with the theme. |
| `bg-blue-*`, `text-blue-*` | Off-brand informational blue. `DeliveryEstimate` shipped a `bg-blue-50` chip with `text-blue-600` on three live surfaces; it never inverted, so it became a white slab in dark mode. | Nowhere. An informational surface is `bg-muted` + `border-border`; the brand accent is `primary` / `primary-strong`. |
| `bg-green-*`, `text-green-*` | A second, non-token success palette. `ShippingSelector` shipped `bg-green-100 text-green-700` beside the sanctioned `emerald` treatment. | Nowhere. Match `ShippingBadge`: `bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200`. |
| `text-red-*`, `border-red-*` | Error state bypassing the `destructive` token, so it cannot follow the theme. | Nowhere. Use `text-destructive` / `border-destructive`. |

**Forbidden outright:** any `purple-*` class, any `yellow-*` class, any raw hex literal.

## Typography

Single family, Inter, already loaded. Discipline over novelty.

- Display/heading: `font-semibold` with **negative tracking** `tracking-tight` (`-0.02em`). Apple DNA:
  larger type needs tighter tracking or it reads as cheap.
- Body: `text-sm` / `text-base`, normal tracking.
- Labels/eyebrows: `text-xs font-medium uppercase tracking-wider text-muted-foreground`. One eyebrow
  style, used consistently — this is most of what makes a storefront look designed.
- Prices: `font-semibold tabular-nums` so columns align.
- Never more than **two** type sizes within one component.

## Spacing & shape

- Section rhythm: `py-12` mobile → `py-16`/`py-20` desktop. Generous, consistent.
- Card radius: `rounded-2xl` (16px) standard, `rounded-full` only for pill CTAs.
- Cards: `bg-card border border-border`. **No drop shadows on chrome** — reserve elevation for
  interactive hover states only (`hover:shadow-md` on a card is fine; a permanent heavy shadow is not).
- Dividers: `border-border`, never a background-colour change.

## Motion

- Restraint. Transitions `150–200ms`, `ease-out`. Nothing bounces, nothing springs.
- Hover states change colour or border. They do not translate the element.
- All motion must respect `prefers-reduced-motion` (handled globally in `globals.css`; components
  must not reintroduce unconditional animation).

## Components

- **Preloader** — full-bleed overlay, brand-tinted, dismisses once. Must set
  `aria-busy`/`role="status"` with a visually-hidden label, and must not trap focus or block
  interaction indefinitely. Honour reduced motion.
- **ScrollToTop** — resets scroll on route change. Must not hijack back/forward, must not fight
  in-page anchors, and must be a no-op on first paint.

## Rules for every change

1. No new dependencies.
2. No raw hex, no `yellow-*`, no `purple-*`.
3. If a colour has no token, **add a token** — do not hardcode.
4. Prefer removing chrome over adding it.
5. Do not restructure JSX or change behaviour while restyling. Style-only diffs.
6. `formatPrice` from `@/lib/utils` for all money. Never inline `$` templates.
