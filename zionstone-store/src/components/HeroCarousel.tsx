'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { maxDiscountPercent } from '@/data/products';
import { FREE_SHIPPING_THRESHOLD } from '@/lib/shipping';
import { formatPrice } from '@/lib/utils';

/**
 * Badges are derived from the data, not typed by hand. The old copy claimed
 * "Up to 40% Off" and "Free Shipping Included" while the catalogue topped out
 * at a 21% cut and free shipping only starts above a threshold — both claims
 * outran what the store actually does.
 */
const deepestDiscount = maxDiscountPercent();

interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  cta: string;
  ctaLink: string;
  image: string;
  imageWidth: number;
  imageHeight: number;
  badge?: string;
}

const slides: HeroSlide[] = [
  {
    id: 1,
    title: 'Power Your Sound',
    subtitle: 'Premium instruments and pro audio equipment with shipping',
    cta: 'Shop Instruments',
    ctaLink: '/products',
    image: '/images/1.jpg',
    imageWidth: 372,
    imageHeight: 1137,
    badge: `Free Shipping Over ${formatPrice(FREE_SHIPPING_THRESHOLD)}`,
  },
  {
    id: 2,
    title: 'Studio Essentials',
    subtitle: 'Build your dream recording setup with top brands',
    cta: 'Shop Studio Gear',
    ctaLink: '/products?category=recording-gear',
    image: '/images/r1.png',
    imageWidth: 880,
    imageHeight: 880,
    badge: deepestDiscount > 0 ? `Up to ${deepestDiscount}% Off` : undefined,
  },
  {
    id: 3,
    title: 'Keys & Synths',
    subtitle: 'From vintage pianos to cutting-edge synthesizers',
    cta: 'Explore Keyboards',
    ctaLink: '/products?category=keyboards-synths',
    image: '/images/m2.png',
    imageWidth: 880,
    imageHeight: 880,
  },
];

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  // With autoplay gone, a control cluster that cannot change anything is a lie.
  // A single-slide hero renders no arrows and no dots at all.
  const hasControls = slides.length > 1;

  const prev = () => setCurrent((current - 1 + slides.length) % slides.length);
  const next = () => setCurrent((current + 1) % slides.length);

  return (
    <section className="relative bg-secondary text-secondary-foreground overflow-hidden">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Text column. The photograph never overlaps it, so the copy sits on
              the flat `bg-secondary` surface at full strength — no scrim needed. */}
          <div className="relative z-10">
            {slides.map((slide, index) => {
              const isActive = index === current;
              return (
                <div
                  key={slide.id}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`Slide ${index + 1} of ${slides.length}`}
                  // Only the active slide is announced, and only the active
                  // slide's CTA is reachable by keyboard.
                  inert={!isActive}
                  className={`transition-all duration-500 ${
                    isActive
                      ? 'opacity-100 translate-x-0'
                      : 'opacity-0 absolute inset-0 pointer-events-none translate-x-8'
                  }`}
                >
                  {slide.badge && (
                    /* `text-primary` not `text-primary-strong`: this is a dark
                       surface in BOTH modes, and the light-mode strong token
                       (#7f5f2f) measures 2.65:1 on `--secondary` #30201c.

                       The pill carries a border and NO fill. Any tint behind
                       the text was measured and all of them lose contrast:
                       `bg-primary/10` gave 4.17:1 (light) / 4.30:1 (dark) and
                       `bg-secondary-foreground/10` only 3.54:1 / 3.73:1, both
                       under the 4.5:1 AA threshold for 14px text. An unfilled
                       pill measures 4.80:1 / 5.08:1 and passes. */
                    <div className="inline-flex items-center gap-2 px-4 py-2 border border-primary/30 rounded-full text-primary text-sm mb-6">
                      {slide.badge}
                    </div>
                  )}
                  <h1 className="text-4xl md:text-6xl font-semibold tracking-tight mb-6">{slide.title}</h1>
                  <p className="text-xl md:text-2xl text-secondary-foreground/80 mb-8">{slide.subtitle}</p>
                  <Link
                    href={slide.ctaLink}
                    className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-8 py-3 text-sm font-semibold hover:bg-primary/90 transition-colors duration-200 ease-out"
                  >
                    {slide.cta}
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Product column. The photograph renders at full opacity — it is the
              content, and nothing is layered over it. Separation from the
              `bg-secondary` canvas comes from the card frame below, which is
              layout, not a tint: /images/1.jpg is an opaque white-background
              JPEG and would otherwise float as a raw white slab. */}
          <div className="hidden lg:block relative z-10">
            {slides.map((slide, index) => {
              const isActive = index === current;
              return (
                <div
                  key={`img-${slide.id}`}
                  inert={!isActive}
                  className={`transition-all duration-500 ${
                    isActive
                      ? 'opacity-100 scale-100'
                      : 'opacity-0 absolute inset-0 scale-95 pointer-events-none'
                  }`}
                >
                  <div className="mx-auto w-full max-w-md rounded-card bg-card border border-border p-4 flex justify-center">
                    <Image
                      src={slide.image}
                      alt={slide.title}
                      width={slide.imageWidth}
                      height={slide.imageHeight}
                      sizes="(min-width: 1024px) 448px, 100vw"
                      className="w-auto max-w-full h-auto max-h-[360px] object-contain"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Every control is a 44x44 hit area (h-11 w-11, WCAG 2.5.8) whose
            visible mark stays small: 20px chevrons, 8px dots. The padding is
            transparent, so the cluster reads no heavier than it did before. */}
        {hasControls && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center">
            <button
              type="button"
              onClick={prev}
              className="flex h-11 w-11 items-center justify-center rounded-full text-secondary-foreground/70 transition-colors duration-200 ease-out hover:text-secondary-foreground"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5" aria-hidden="true" />
            </button>
            <div className="flex items-center">
              {slides.map((slide, index) => {
                const isActive = index === current;
                return (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => setCurrent(index)}
                    className="flex h-11 w-11 items-center justify-center rounded-full"
                    aria-label={`Go to slide ${index + 1} of ${slides.length}`}
                    aria-current={isActive ? 'true' : undefined}
                  >
                    <span
                      aria-hidden="true"
                      className={`block rounded-full transition-all duration-200 ease-out ${
                        isActive
                          ? 'w-6 h-2 bg-secondary-foreground'
                          : 'w-2 h-2 bg-secondary-foreground/40 hover:bg-secondary-foreground/70'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={next}
              className="flex h-11 w-11 items-center justify-center rounded-full text-secondary-foreground/70 transition-colors duration-200 ease-out hover:text-secondary-foreground"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
