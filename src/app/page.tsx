import Link from "next/link";
import { ShippingBadge } from "@/components/shipping";
import { AddToCartButton, ProductImage, ContactOwnerButton } from "@/components/product";
import { HeroCarousel } from "@/components/HeroCarousel";
import { ValueProps } from "@/components/ValueProps";
import { products, isOnSale, discountPercent, getSaleProducts, maxDiscountPercent, getProductBySlug } from "@/data/products";
import { CATEGORIES } from "@/data/categories";
import { formatPrice } from "@/lib/utils";
import { FadeIn } from "@/components/ui/animated";

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
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Featured Gear</h2>
                <p className="text-muted-foreground mt-2">Hand-picked instruments and studio hardware</p>
              </div>
              <Link href="/products" className="font-medium text-primary-strong underline-offset-4 transition-colors duration-200 ease-out hover:text-primary-strong/80 hover:underline">
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
                      <ProductImage image={product.images?.[0] ?? product.emoji ?? ''} name={product.name} />
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
                        <span className="text-lg font-semibold tabular-nums text-primary-strong">{formatPrice(product.price, product.currency ?? 'USD')}</span>
                        {isOnSale(product) && (
                          <span className="text-sm tabular-nums text-muted-foreground line-through">
                            {formatPrice(product.originalPrice as number, product.currency ?? 'USD')}
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
      <section className="bg-muted py-16 md:py-24">
        <div className="container mx-auto px-4">
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
      <section className="bg-muted py-16 md:py-24">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="flex items-center justify-between mb-8">
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
              <Link href="/products?sale=true" className="font-medium text-primary-strong underline-offset-4 transition-colors duration-200 ease-out hover:text-primary-strong/80 hover:underline">
                See All Deals →
              </Link>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {deals.map((deal, index) => (
              <FadeIn key={deal.id} delay={index * 0.15}>
                <div
                  className="group rounded-card border border-border bg-card p-6 shadow-card transition-shadow duration-200 ease-out hover:shadow-card-hover"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-20 w-20 items-center justify-center rounded-card bg-muted text-4xl">
                      {deal.emoji}
                    </div>
                    <div className="flex-1">
                      <div className="mb-2 inline-block rounded-full bg-destructive px-2 py-1 text-xs font-semibold text-destructive-foreground">
                        {discountPercent(deal)}% OFF
                      </div>
                      <h3 className="font-semibold tracking-tight transition-colors duration-200 ease-out group-hover:text-primary-strong">{deal.name}</h3>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-xl font-semibold tabular-nums text-primary">{formatPrice(deal.price)}</span>
                        {isOnSale(deal) && (
                          <span className="text-sm tabular-nums text-muted-foreground line-through">{formatPrice(deal.originalPrice as number)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
