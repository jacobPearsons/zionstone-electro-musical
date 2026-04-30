'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  cta: string;
  ctaLink: string;
  image: string;
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
    badge: 'Free Shipping Included',
  },
  {
    id: 2,
    title: 'Studio Essentials',
    subtitle: 'Build your dream recording setup with top brands',
    cta: 'Shop Studio Gear',
    ctaLink: '/products?category=recording-gear',
    image: '/images/r1.png',
    badge: 'Up to 40% Off',
  },
  {
    id: 3,
    title: 'Keys & Synths',
    subtitle: 'From vintage pianos to cutting-edge synthesizers',
    cta: 'Explore Keyboards',
    ctaLink: '/products?category=keyboards-synths',
    image: '/images/m2.png',
  },
];

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const prev = () => setCurrent((current - 1 + slides.length) % slides.length);
  const next = () => setCurrent((current + 1) % slides.length);

  return (
    <section 
      className="relative bg-gradient-to-br from-yellow-900 via-indigo-900 to-black text-white overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-yellow-400 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-400 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-20 md:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="relative z-10">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`transition-all duration-500 ${
                  index === current 
                    ? 'opacity-100 translate-x-0' 
                    : 'opacity-0 absolute inset-0 pointer-events-none translate-x-8'
                }`}
              >
                {slide.badge && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full text-green-300 text-sm mb-6">
                    {slide.badge}
                  </div>
                )}
                <h1 className="text-4xl md:text-6xl font-bold mb-6">{slide.title}</h1>
                <p className="text-xl md:text-2xl text-yellow-100 mb-8">{slide.subtitle}</p>
                <Link
                  href={slide.ctaLink}
                  className="inline-flex items-center justify-center rounded-md bg-white text-yellow-900 px-8 py-3 text-sm font-semibold hover:bg-yellow-50 transition-colors"
                >
                  {slide.cta}
                </Link>
              </div>
            ))}
          </div>
          
          <div className="hidden lg:block relative z-10">
            {slides.map((slide) => (
              <div
                key={`img-${slide.id}`}
                className={`transition-all duration-500 ${
                  slide.id === slides[current].id
                    ? 'opacity-100 scale-100'
                    : 'opacity-0 absolute inset-0 scale-95'
                }`}
              >
                {slide.image.startsWith('/') ? (
                  <img src={slide.image} alt={slide.title} className="w-full max-w-md object-contain opacity-60 ml-auto" />
                ) : (
                  <div className="text-center">
                    <span className="text-9xl opacity-50">{slide.image}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
          <button 
            onClick={prev} 
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === current ? 'bg-white' : 'bg-white/30'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
          <button 
            onClick={next} 
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}