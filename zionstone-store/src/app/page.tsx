import Link from "next/link";
import { Instagram, MessageCircle, Phone, Quote } from "lucide-react";
import { ShippingBadge } from "@/components/shipping";
import { AddToCartButton, ProductImage, ContactOwnerButton } from "@/components/product";
import { HeroCarousel } from "@/components/HeroCarousel";
import { ValueProps } from "@/components/ValueProps";
import { products, isOnSale, discountPercent, getSaleProducts, maxDiscountPercent, getProductBySlug } from "@/data/products";
import { CATEGORIES } from "@/data/categories";
import { formatPrice } from "@/lib/utils";
import { FadeIn } from "@/components/ui/animated";
import { OWNER_PHONES, ownerWhatsAppHref } from "@/lib/contact";

const INSTAGRAM_HANDLE = "Zionstoneelectro_musicals";
const INSTAGRAM_URL = `https://instagram.com/${INSTAGRAM_HANDLE}`;
const WHATSAPP_HREF = ownerWhatsAppHref(
  OWNER_PHONES[0],
  "Hello Zionstone, I'd like to make an enquiry."
);

const testimonials = [
  {
    quote:
      "I found the perfect keyboard here. The team knew exactly what I needed and every piece of gear was genuine.",
    name: "Oluwaseun A.",
    city: "Lagos",
  },
  {
    quote:
      "They guided us to the right PA setup for our church. Trusted advice, and the sound across our services is transformed.",
    name: "Pastor Emeka",
    city: "Abuja",
  },
  {
    quote:
      "Their support with my home studio setup was excellent. Everything was connected and sounding great from day one.",
    name: "Tunde B.",
    city: "Port Harcourt",
  },
];

const instagramTiles = [
  "from-primary/30 to-primary/5",
  "from-muted to-primary/15",
  "from-primary/10 to-secondary",
  "from-secondary to-primary/20",
  "from-primary/25 to-muted",
  "from-muted to-secondary",
  "from-primary/15 to-primary/5",
  "from-secondary to-muted",
  "from-primary/20 to-secondary",
];

const whatsappTiles = [
  "from-[#25D366]/30 to-[#128C7E]/10",
  "from-muted to-[#25D366]/15",
  "from-[#128C7E]/20 to-secondary",
  "from-secondary to-[#25D366]/25",
  "from-[#25D366]/40 to-muted",
  "from-muted to-secondary",
  "from-[#128C7E]/25 to-[#25D366]/10",
  "from-secondary to-muted",
  "from-[#25D366]/20 to-secondary",
];

const featuredSlugs = [
  'krk-rokit-5-g4-powered-studio-monitor',
  'shure-sm58-legendary-professional-cardioid-dynamic-vocal-microphone',
  'yamaha-psr-sx720-digital-keyboard',
  'behringer-wing-compact-digital-mixing-console',
];
const featuredProducts = featuredSlugs
  .map((slug) => getProductBySlug(slug))
  .filter((p): p is NonNullable<typeof p> => Boolean(p));

const deals = getSaleProducts()
  .filter((deal): deal is typeof deal & { price: number } => deal.price != null)
  .slice(0, 3);

/**
 * "Up to N% off" is a storewide claim, so it is derived from the whole
 * catalogue by the shared helper — the hero badge reads the same number, which
 * is why neither copy hardcodes a percentage.
 *
 * The claim used to live in its own pulsing-emoji band under the hero. That
 * band is gone, so the number is now stated once, in the section that actually
 * contains the discounted products.
 */
const deepestDiscount = maxDiscountPercent();

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Carousel */}
      <HeroCarousel />


      {/* Featured Products */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Featured Gear</h2>
                <p className="text-muted-foreground mt-2">Hand-picked instruments and studio hardware</p>
              </div>
              <Link href="/products" className="font-medium text-primary-strong underline-offset-4 transition-colors duration-200 ease-out hover:text-primary-strong/80 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
                View All →
              </Link>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product, index) => (
              <FadeIn key={product.slug} delay={index * 0.1}>
                <div
                  className="group overflow-hidden rounded-card border border-border bg-card text-card-foreground shadow-card transition-shadow duration-200 ease-out hover:shadow-card-hover"
                >
                  <Link href={`/products/${product.slug}`}>
                    <div className="relative flex aspect-square items-center justify-center bg-muted">
                      <ProductImage
                        image={product.images?.[0] ?? product.emoji ?? ''}
                        name={product.name}
                        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      />
                      <div className="absolute top-3 left-3">
                        <ShippingBadge
                          shipsInDays={product.shipsInDays}
                          twoDayEligible={product.twoDayEligible}
                        />
                      </div>
                      {isOnSale(product) && (
                        <div className="absolute top-3 right-3 rounded-full bg-destructive px-2 py-1 text-xs font-semibold text-destructive-foreground">
                          {discountPercent(product)}% OFF
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="p-4">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{product.brand}</p>
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="mt-1 line-clamp-2 font-semibold tracking-tight transition-colors duration-200 ease-out group-hover:text-primary-strong">
                        {product.name}
                      </h3>
                    </Link>
                    {product.price != null ? (
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-lg font-semibold tabular-nums text-primary-strong">{formatPrice(product.price, product.currency ?? 'NGN')}</span>
                        {isOnSale(product) && (
                          <span className="text-sm tabular-nums text-muted-foreground line-through">
                            {formatPrice(product.originalPrice as number, product.currency ?? 'NGN')}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-lg font-semibold tabular-nums text-primary-strong">Price on Request</span>
                      </div>
                    )}
                    {product.price != null ? (
                      <AddToCartButton
                        product={{
                          productId: product.id,
                          name: product.name,
                          price: product.price,
                          image: product.images?.[0] ?? product.emoji ?? '',
                          quantity: 1,
                          slug: product.slug,
                          brand: product.brand,
                          currency: product.currency,
                        }}
                      />
                    ) : (
                      <ContactOwnerButton productName={product.name} productSlug={product.slug} />
                    )}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-muted py-12 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <h2 className="mb-4 text-center text-3xl font-semibold tracking-tight md:text-4xl">Shop by Category</h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              {CATEGORIES.length} ranges, {products.length} products. Filter by range, brand, or price.
            </p>
          </FadeIn>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
            {CATEGORIES.map((category, index) => {
              const Icon = category.icon;
              return (
                <FadeIn key={category.slug} delay={0.2 + index * 0.1}>
                  <Link
                    href={category.href}
                    className="group block h-full rounded-card border border-border bg-card p-6 shadow-card transition-colors duration-200 ease-out hover:border-primary hover:shadow-card-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-card bg-muted">
                      <Icon className="h-8 w-8 text-foreground" aria-hidden="true" />
                    </div>
                    <h3 className="text-lg font-semibold tracking-tight transition-colors duration-200 ease-out group-hover:text-primary-strong">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                    )}
                    <p className="text-sm tabular-nums text-muted-foreground mt-3">
                      {category.count} {category.count === 1 ? "product" : "products"}
                    </p>
                  </Link>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* Service strip — the one trust band the page keeps. It used to sit
          between the category rail and the product grid, where it pushed
          merchandise below the fold and repeated the header/footer claims. */}
      <ValueProps />

      {/* Today's Deals */}
      <section className="bg-muted py-12 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                  Today&apos;s Deals
                </h2>
                <p className="text-muted-foreground mt-2">
                  {deepestDiscount > 0
                    ? `Up to ${deepestDiscount}% off select gear`
                    : "Every price in the catalogue, no inflated was-prices"}
                </p>
              </div>
              <Link href="/products?sale=true" className="self-start font-medium text-primary-strong underline-offset-4 transition-colors duration-200 ease-out hover:text-primary-strong/80 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:self-auto">
                See All Deals →
              </Link>
            </div>
          </FadeIn>
          {/* On a small screen three full-width stacked cards bury the section
              below the fold, so the deals become a swipeable snap rail instead;
              md+ keeps the prose-style 3-up grid. `scrollbar-hide` keeps the
              rail from painting a chunky scrollbar over the muted canvas. */}
          <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 scrollbar-hide md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 md:pb-0">
            {deals.map((deal, index) => (
              <FadeIn key={deal.id} delay={index * 0.15} className="shrink-0 basis-[72%] snap-start sm:basis-[45%] md:basis-auto">
                <Link
                  href={`/products/${deal.slug}`}
                  className="group block h-full rounded-card border border-border bg-card p-4 shadow-card transition-shadow duration-200 ease-out hover:shadow-card-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-card bg-muted">
                    <ProductImage
                      image={deal.images?.[0] ?? deal.emoji ?? ''}
                      name={deal.name}
                      sizes="(min-width: 768px) 33vw, 50vw"
                    />
                    <div className="absolute top-3 right-3 rounded-full bg-destructive px-2 py-1 text-xs font-semibold text-destructive-foreground">
                      {discountPercent(deal)}% OFF
                    </div>
                  </div>
                  <div className="mt-3">
                    <h3 className="line-clamp-2 font-semibold tracking-tight transition-colors duration-200 ease-out group-hover:text-primary-strong">
                      {deal.name}
                    </h3>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-xl font-semibold tabular-nums text-primary">{formatPrice(deal.price)}</span>
                      {isOnSale(deal) && (
                        <span className="text-sm tabular-nums text-muted-foreground line-through">{formatPrice(deal.originalPrice as number)}</span>
                      )}
                    </div>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground md:hidden">
            Swipe to browse more deals
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Testimonials
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                What Our Customers Say
              </h2>
            </div>
          </FadeIn>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <FadeIn key={testimonial.name} delay={index * 0.1}>
                <figure className="flex h-full flex-col rounded-card border border-border bg-card p-6 shadow-card">
                  <Quote className="h-6 w-6 text-primary" aria-hidden="true" />
                  <blockquote className="mt-4 flex-1 text-muted-foreground">
                    {testimonial.quote}
                  </blockquote>
                  <figcaption className="mt-6 text-sm font-medium">
                    {testimonial.name} <span className="text-muted-foreground">· {testimonial.city}</span>
                  </figcaption>
                </figure>
              </FadeIn>
            ))}
          </div>
          <FadeIn>
            <p className="mt-10 text-center text-sm text-muted-foreground">
              Have a story?{" "}
              <a
                href={ownerWhatsAppHref(
                  OWNER_PHONES[0],
                  "Hi Zionstone, I'd like to share my experience with you."
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary-strong underline-offset-4 transition-colors duration-200 ease-out hover:text-primary-strong/80 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Tell us
              </a>
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Social — Instagram and WhatsApp share one muted band. They already
          speak the same banner/grid/link grammar, so both blocks sit intact
          inside a single parent section rather than two stacked full-height
          ones. The container is a flex column so the two blocks are spaced by
          `gap` instead of a hand-tuned margin. The Phone section below flips to
          the plain surface so the page keeps its muted/plain alternation. */}
      <section className="bg-muted py-12 md:py-20">
        <div className="container mx-auto flex flex-col gap-16 px-4 sm:px-6 md:gap-24 lg:px-8">
          {/* Instagram */}
          <div>
            <FadeIn>
              <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-pill bg-gradient-to-tr from-[#feda75] via-[#d62976] to-[#4f5bd5] p-[2px] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <span className="inline-flex items-center gap-2 rounded-pill bg-background px-4 py-2">
                    <Instagram className="h-5 w-5" aria-hidden="true" />
                    <span className="font-medium">@{INSTAGRAM_HANDLE}</span>
                  </span>
                </a>
                <h2 className="mt-6 text-3xl font-semibold tracking-tight md:text-4xl">
                  Follow @{INSTAGRAM_HANDLE}
                </h2>
                <p className="mt-3 text-muted-foreground">
                  New arrivals, installs, and studio inspiration from around the store.
                </p>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Follow @${INSTAGRAM_HANDLE} on Instagram`}
                className="relative mx-auto mt-10 inline-grid grid-cols-3 gap-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {instagramTiles.map((tile, index) => (
                  <span
                    key={index}
                    aria-hidden="true"
                    className={`h-16 w-16 rounded-lg bg-gradient-to-br sm:h-20 sm:w-20 ${tile}`}
                  />
                ))}
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-pill bg-gradient-to-tr from-[#feda75] via-[#d62976] to-[#4f5bd5] text-white shadow-card">
                    <Instagram className="h-7 w-7" aria-hidden="true" />
                  </span>
                </span>
              </a>
            </FadeIn>
            <FadeIn delay={0.15}>
              <p className="mt-8 text-center">
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-medium text-primary-strong underline-offset-4 transition-colors duration-200 ease-out hover:text-primary-strong/80 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  Follow us on Instagram
                </a>
              </p>
            </FadeIn>
          </div>

          {/* WhatsApp — the same banner/grid/link grammar as Instagram, in the
              WhatsApp brand green. Contact channels are facts, not claims, so
              the copy reads numbers and intents rather than promises. */}
          <div>
            <FadeIn>
              <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
                <a
                  href={WHATSAPP_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-pill bg-gradient-to-tr from-[#25D366] via-[#128C7E] to-[#075E54] p-[2px] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <span className="inline-flex items-center gap-2 rounded-pill bg-background px-4 py-2">
                    <MessageCircle className="h-5 w-5" aria-hidden="true" />
                    <span className="font-medium">{OWNER_PHONES[0].label}</span>
                  </span>
                </a>
                <h2 className="mt-6 text-3xl font-semibold tracking-tight md:text-4xl">
                  Chat With Us on WhatsApp
                </h2>
                <p className="mt-3 text-muted-foreground">
                  Price checks, stock questions, or orders — send a message and we&apos;ll take it from there.
                </p>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <a
                href={WHATSAPP_HREF}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Message ${OWNER_PHONES[0].label} on WhatsApp`}
                className="relative mx-auto mt-10 inline-grid grid-cols-3 gap-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {whatsappTiles.map((tile, index) => (
                  <span
                    key={index}
                    aria-hidden="true"
                    className={`h-16 w-16 rounded-lg bg-gradient-to-br sm:h-20 sm:w-20 ${tile}`}
                  />
                ))}
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-pill bg-gradient-to-tr from-[#25D366] via-[#128C7E] to-[#075E54] text-white shadow-card">
                    <MessageCircle className="h-7 w-7" aria-hidden="true" />
                  </span>
                </span>
              </a>
            </FadeIn>
            <FadeIn delay={0.15}>
              <p className="mt-8 text-center">
                <a
                  href={WHATSAPP_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-medium text-primary-strong underline-offset-4 transition-colors duration-200 ease-out hover:text-primary-strong/80 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  Message us on WhatsApp
                </a>
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Phone — on the plain surface, because the merged Social band above
          now owns the muted slot that used to alternate around it. */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
              <span className="inline-flex items-center gap-2 rounded-pill bg-gradient-to-tr from-slate-600 via-slate-800 to-slate-950 p-[2px]">
                <span className="inline-flex items-center gap-2 rounded-pill bg-background px-4 py-2">
                  <Phone className="h-5 w-5" aria-hidden="true" />
                  <span className="font-medium">Call the Store</span>
                </span>
              </span>
              <h2 className="mt-6 text-3xl font-semibold tracking-tight md:text-4xl">
                Talk to a Real Person
              </h2>
              <p className="mt-3 text-muted-foreground">
                Choosing the right gear or checking what&apos;s in stock? Reach us directly on any line below.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {OWNER_PHONES.map((phone) => (
                  <a
                    key={phone.tel}
                    href={`tel:${phone.tel}`}
                    className="inline-flex items-center justify-center gap-2 rounded-pill bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors duration-200 ease-out hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <Phone className="h-4 w-4" aria-hidden="true" />
                    {phone.label}
                  </a>
                ))}
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="mt-8 text-center">
              <a
                href={`tel:${OWNER_PHONES[0].tel}`}
                className="inline-flex items-center gap-2 font-medium text-primary-strong underline-offset-4 transition-colors duration-200 ease-out hover:text-primary-strong/80 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                Call {OWNER_PHONES[0].label}
              </a>
            </p>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
