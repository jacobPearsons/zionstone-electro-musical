import Link from "next/link";
import { Shield, Truck, Headphones, Zap, Guitar, Music, Mic2, Drum } from "lucide-react";
import { ShippingBadge } from "@/components/shipping";
import { AddToCartButton } from "@/components/product";
import { HeroCarousel } from "@/components/HeroCarousel";
import { CategoryMarquee } from "@/components/CategoryMarquee";
import { ValueProps } from "@/components/ValueProps";
import { CountdownTimer, FlashDealCard } from "@/components/CountdownTimer";
import { products } from "@/data/products";
import { FadeIn, StaggerContainer } from "@/components/ui/animated";

const categories = [
  { name: "Guitars & Basses", slug: "guitars-basses", icon: Guitar, desc: "Electric, acoustic, and bass guitars" },
  { name: "Keyboards & Synths", slug: "keyboards-synths", icon: Music, desc: "Pianos, synths, and MIDI controllers" },
  { name: "Recording Gear", slug: "recording-gear", icon: Mic2, desc: "Microphones, interfaces, monitors" },
  { name: "Drums & Percussion", slug: "drums-percussion", icon: Drum, desc: "Electronic drums, cymbals, and accessories" },
];

const featuredProducts = products.slice(0, 4);

const deals = products.filter(p => p.originalPrice).slice(0, 3);

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Category Marquee */}
      <CategoryMarquee />

      {/* You've Got Your Pick of Deals */}
      <section className="py-16 bg-gradient-to-r from-yellow-600 to-teal-600 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <h1 className="text-4xl md:text-5xl font-bold">You&apos;ve got your pick of deals</h1>
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-4xl">🎸</span>
              </div>
            </div>
            <Link 
              href="/products?sale=true" 
              className="inline-flex items-center justify-center px-6 py-3 bg-white dark:bg-gray-800 text-yellow-600 dark:text-yellow-400 font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Shop now
            </Link>
          </div>
        </div>
      </section>

      {/* Flash Deals Banner */}
      <section className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-4 text-sm font-medium">
            <span className="animate-pulse">🎵</span>
            <span>Limited Deals: Up to 40% off select gear today!</span>
            <span className="animate-pulse">🎵</span>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <FadeIn>
            <h2 className="text-3xl font-bold text-center mb-4">Shop by Category</h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              From electric guitars to studio monitors, find everything you need to create your perfect sound
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <FadeIn key={category.slug} delay={0.2 + index * 0.1}>
                  <Link
                    href={`/products?category=${category.slug}`}
                    className="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 p-6 shadow-md hover:shadow-xl transition-all hover:-translate-y-1"
                  >
                    <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:bg-yellow-200 dark:group-hover:bg-yellow-900/50 transition-colors">
                      <Icon className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <h3 className="text-lg font-semibold group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">{category.desc}</p>
                  </Link>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* Value Props */}
      <ValueProps />

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold">Featured Gear</h2>
                <p className="text-muted-foreground mt-2">Our most popular instruments and equipment with 2-day shipping</p>
              </div>
              <Link href="/products" className="text-yellow-600 dark:text-yellow-400 hover:underline font-medium">
                View All →
              </Link>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product, index) => (
              <FadeIn key={product.slug} delay={index * 0.1}>
                <div
                  className="group rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden hover:shadow-lg transition-all"
                >
                  <Link href={`/products/${product.slug}`}>
                    <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 relative flex items-center justify-center">
                      <span className="text-7xl">{product.emoji}</span>
                      <div className="absolute top-3 left-3">
                        <ShippingBadge
                          shipsInDays={product.shipsInDays}
                          twoDayEligible={product.twoDayEligible}
                        />
                      </div>
                      {(product.originalPrice ?? 0) > product.price && (
                        <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                          {Math.round((1 - product.price / (product.originalPrice ?? product.price)) * 100)}% OFF
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="p-4">
                    <p className="text-xs text-muted-foreground">{product.brand}</p>
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="font-semibold mt-1 line-clamp-2 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-lg font-bold">${product.price}</span>
                      {(product.originalPrice ?? 0) > product.price && (
                        <span className="text-sm text-muted-foreground line-through">
                          ${product.originalPrice ?? product.price}
                        </span>
                      )}
                    </div>
                    <AddToCartButton
                      product={{
                        productId: product.slug,
                        name: product.name,
                        price: product.price,
                        image: product.emoji,
                        quantity: 1,
                        slug: product.slug,
                        brand: product.brand,
                      }}
                    />
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Today's Deals */}
      <section className="py-16 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold flex items-center gap-2">
                  <span className="animate-pulse">⚡</span>
                  Today&apos;s Deals
                </h2>
                <p className="text-muted-foreground mt-2">Limited time offers on pro audio and instruments</p>
              </div>
              <Link href="/products?sale=true" className="text-yellow-600 dark:text-yellow-400 hover:underline font-medium">
                See All Deals →
              </Link>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {deals.map((deal, index) => (
              <FadeIn key={deal.id} delay={index * 0.15}>
                <div
                  className="group bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-xl transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-4xl">
                      {deal.emoji}
                    </div>
                    <div className="flex-1">
                      <div className="inline-block bg-red-500 text-white text-xs font-bold px-2 py-1 rounded mb-2">
                        {deal.originalPrice && `${Math.round((1 - deal.price / deal.originalPrice) * 100)}% OFF`}
                      </div>
                      <h3 className="font-semibold group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">{deal.name}</h3>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-xl font-bold">${deal.price}</span>
                        {deal.originalPrice && deal.originalPrice > deal.price && (
                          <span className="text-sm text-muted-foreground line-through">${deal.originalPrice}</span>
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

      {/* Why Choose Us */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <FadeIn>
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose ElectroMuscial Store</h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: Truck, title: "2-Day Shipping", desc: "Fast delivery on eligible instruments and gear" },
              { icon: Shield, title: "Authenticity Guaranteed", desc: "100% genuine products from authorized dealers" },
              { icon: Zap, title: "Tech Support", desc: "Expert advice on compatibility and setup" },
              { icon: Headphones, title: "Easy Returns", desc: "30-day hassle-free returns on all purchases" },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <FadeIn key={i} delay={i * 0.1}>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-yellow-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-8 h-8 text-yellow-400" />
                    </div>
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    <p className="text-gray-400 mt-2">{item.desc}</p>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
