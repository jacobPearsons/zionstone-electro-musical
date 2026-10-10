# E-Commerce Full Spec Upgrade Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the complete e-commerce website to match the ecommerce-layout-spec.md specification with all 24 components implemented.

**Architecture:** This is a Next.js 14 app with Tailwind CSS. We're adding new components while updating existing ones. Key files already exist in `src/components/`, `src/app/`, and `src/lib/`. Components will follow the existing pattern using shadcn/ui-like primitives.

**Tech Stack:** Next.js 14 (App Router), Tailwind CSS, Lucide React icons, React Context for state

---

## File Structure

### New Components to Create
- `src/components/AnnouncementBar.tsx` - Top promo bar with dismiss
- `src/components/HeroCarousel.tsx` - Hero with carousel
- `src/components/CategoryMarquee.tsx` - Infinite scroll marquee
- `src/components/MiniCart.tsx` - Slide-out cart drawer
- `src/components/MegaMenu.tsx` - Desktop mega menu
- `src/components/Newsletter.tsx` - Newsletter signup section
- `src/components/SearchBar.tsx` - Header search with autocomplete
- `src/components/theme-provider.tsx` - Dark mode context
- `src/components/ui/skeleton.tsx` - Loading skeleton

### Existing Files to Modify
- `src/app/layout.tsx` - Add AnnouncementBar, wrap providers
- `src/components/header.tsx` - Add search, mega menu, update styling
- `src/components/footer.tsx` - Add newsletter, improve layout
- `src/app/page.tsx` - Use new carousel, add marquee
- `src/components/product/ProductCard.tsx` - Add quick action buttons
- `src/app/globals.css` - Add CSS variables for dark mode
- `src/lib/cart-context.tsx` - Add mini-cart state

---

### Task 1: AnnouncementBar Component

**Files:**
- Create: `src/components/AnnouncementBar.tsx`

- [ ] **Step 1: Create AnnouncementBar component**

```tsx
'use client';

import { X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface AnnouncementBarProps {
  message: string;
  link?: string;
  linkText?: string;
}

export function AnnouncementBar({ message, link, linkText = 'Shop Now' }: AnnouncementBarProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('announcement-dismissed');
    if (stored) {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsVisible(false);
      localStorage.setItem('announcement-dismissed', 'true');
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`bg-slate-900 text-white py-2 transition-all duration-300 ${
        isAnimating ? 'opacity-0 -translate-y-full' : 'opacity-100'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-4 text-sm">
          <p>{message}</p>
          {link && (
            <a href={link} className="font-medium underline hover:text-yellow-300">
              {linkText}
            </a>
          )}
          <button
            onClick={handleDismiss}
            className="absolute right-4 p-1 hover:bg-white/10 rounded transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add to layout**

Modify `src/app/layout.tsx` to import and use AnnouncementBar:

```tsx
import { AnnouncementBar } from "@/components/AnnouncementBar";
// Add after CartProvider opening tag:
<AnnouncementBar 
  message="Free 2-Day Shipping on orders over $50" 
  link="/products"
  linkText="Learn More"
/>
```

---

### Task 2: Header - Search, Mega Menu, Improved Navigation

**Files:**
- Modify: `src/components/header.tsx`
- Create: `src/components/SearchBar.tsx`
- Create: `src/components/MegaMenu.tsx`

- [ ] **Step 1: Create SearchBar component**

```tsx
'use client';

import { Search, X, Mic } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface SearchResult {
  name: string;
  category: string;
  slug: string;
}

const mockResults: SearchResult[] = [
  { name: 'Fender Stratocaster', category: 'Guitars', slug: 'fender-stratocaster' },
  { name: 'Yamaha P-45 Digital Piano', category: 'Keyboards', slug: 'yamaha-p-45' },
  { name: 'Shure SM7B Microphone', category: 'Microphones', slug: 'shure-sm7b' },
];

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (query.length > 1) {
      const filtered = mockResults.filter(r => 
        r.name.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
      setIsOpen(filtered.length > 0);
    } else {
      setIsOpen(false);
    }
  }, [query]);

  const handleSelect = (slug: string) => {
    setIsOpen(false);
    setQuery('');
    router.push(`/products/${slug}`);
  };

  return (
    <div className="relative hidden md:block w-full max-w-md">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search instruments, gear..."
          className="w-full pl-10 pr-10 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <button 
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
          aria-label="Voice search"
        >
          <Mic className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
      
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg z-50 max-h-60 overflow-auto">
          {results.map((result) => (
            <button
              key={result.slug}
              onClick={() => handleSelect(result.slug)}
              className="w-full px-4 py-3 text-left hover:bg-yellow-50 flex items-center justify-between"
            >
              <span>{result.name}</span>
              <span className="text-xs text-muted-foreground">{result.category}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create MegaMenu component**

```tsx
'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

const menuCategories = [
  {
    name: 'Guitars & Basses',
    items: ['Electric Guitars', 'Acoustic Guitars', 'Bass Guitars', 'Guitar Packages'],
    brands: ['Fender', 'Gibson', 'Ibanez', 'PRS'],
  },
  {
    name: 'Keyboards & Synths',
    items: ['Digital Pianos', 'Synthesizers', 'MIDI Controllers', 'Workstations'],
    brands: ['Yamaha', 'Roland', 'Korg', 'Nord'],
  },
  {
    name: 'Recording Gear',
    items: ['Audio Interfaces', 'Microphones', 'Studio Monitors', 'Preamps'],
    brands: 'Focusrite', 'Shure', 'Mackie', 'Audio-Technica',
  },
  {
    name: 'Drums & Percussion',
    items: ['Electronic Drums', 'Acoustic Drums', 'Cymbals', 'Hardware'],
    brands: ['Roland', 'Yamaha', 'Pearl', 'Zildjian'],
  },
];

export function MegaMenu() {
  return (
    <div className="absolute top-full left-0 w-full bg-white border shadow-xl z-40 hidden group-hover:block">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-4 gap-8">
          {menuCategories.map((category) => (
            <div key={category.name}>
              <h3 className="font-semibold text-yellow-600 mb-3">{category.name}</h3>
              <ul className="space-y-2">
                {category.items.map((item) => (
                  <li key={item}>
                    <Link 
                      href={`/products?category=${category.name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`}
                      className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
                    >
                      <ChevronRight className="w-3 h-3" />
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-muted-foreground mb-2">Top Brands</p>
                <div className="flex flex-wrap gap-2">
                  {category.brands.map((brand) => (
                    <Link
                      key={brand}
                      href={`/products?brand=${brand}`}
                      className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200"
                    >
                      {brand}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Update Header component**

Rewrite header.tsx to include search and mega menu:

```tsx
'use client';

import * as React from "react";
import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { ShoppingCart, Menu, X, Heart, User, Search, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import { SearchBar } from "./SearchBar";
import { MegaMenu } from "./MegaMenu";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const { totalItems } = useCart();
  const { totalItems: wishlistCount } = useWishlist();

  const categories = [
    { name: 'Guitars & Basses', href: '/products?category=guitars-basses' },
    { name: 'Keyboards & Synths', href: '/products?category=keyboards-synths' },
    { name: 'Recording Gear', href: '/products?category=recording-gear' },
    { name: 'Drums & Percussion', href: '/products?category=drums-percussion' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Logo + Nav */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🎸</span>
              <span className="hidden sm:inline-block font-bold text-lg text-yellow-600">ElectroMuscial</span>
            </Link>
            
            {/* Desktop Navigation with Mega Menu */}
            <nav className="hidden lg:flex items-center gap-6 relative group">
              {categories.map((category) => (
                <Link 
                  key={category.name}
                  href={category.href}
                  className="text-sm font-medium hover:text-yellow-600 transition-colors"
                >
                  {category.name}
                </Link>
              ))}
              <MegaMenu />
            </nav>
          </div>

          {/* Center: Search */}
          <SearchBar />

          {/* Right: Icons */}
          <div className="flex items-center gap-1">
            <Link href="/dashboard?tab=wishlist" className="relative">
              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-pink-500 text-xs text-white flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Button>
            </Link>

            <Link href="/cart" className="relative">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-yellow-600 text-xs text-white flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>

            <SignedIn>
              <Link href="/dashboard" className="hidden lg:block">
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  Account
                </Button>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            
            <SignedOut>
              <div className="hidden lg:flex items-center gap-2">
                <Link href="/sign-in">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/sign-up">
                  <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">Sign Up</Button>
                </Link>
              </div>
            </SignedOut>

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="lg:hidden border-t py-4">
            <div className="flex flex-col gap-4">
              <Link href="/products" className="text-sm font-medium">Products</Link>
              <Link href="/products?category=guitars-basses" className="text-sm font-medium">Guitars</Link>
              <Link href="/products?category=keyboards-synths" className="text-sm font-medium">Keys & Synths</Link>
              <Link href="/products?category=recording-gear" className="text-sm font-medium">Recording</Link>
              <Link href="/products?category=drums-percussion" className="text-sm font-medium">Drums</Link>
              <div className="border-t pt-4">
                <SignedOut>
                  <Link href="/sign-in" className="text-sm font-medium">Sign In</Link>
                </SignedOut>
                <SignedIn>
                  <Link href="/dashboard" className="text-sm font-medium">Dashboard</Link>
                  <Link href="/dashboard?tab=wishlist" className="text-sm font-medium flex items-center gap-2">
                    <Heart className="h-4 w-4" /> Wishlist
                  </Link>
                </SignedIn>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
```

- [ ] **Step 4: Add mobile search button**

Add mobile search toggle in header.tsx - add this button next to the mobile menu button:

```tsx
<Button
  variant="ghost"
  size="icon"
  className="lg:hidden"
  onClick={() => setSearchOpen(!searchOpen)}
>
  <Search className="h-5 w-5" />
</Button>
```

And add mobile search panel when `searchOpen` is true.

---

### Task 3: Hero Carousel

**Files:**
- Create: `src/components/HeroCarousel.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create HeroCarousel component**

```tsx
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
    subtitle: 'Premium instruments and pro audio equipment with 2-day shipping',
    cta: 'Shop Instruments',
    ctaLink: '/products',
    image: '🎸',
    badge: 'Free Shipping over $50',
  },
  {
    id: 2,
    title: 'Studio Essentials',
    subtitle: 'Build your dream recording setup with top brands',
    cta: 'Shop Studio Gear',
    ctaLink: '/products?category=recording-gear',
    image: '🎤',
    badge: 'Up to 40% Off',
  },
  {
    id: 3,
    title: 'Keys & Synths',
    subtitle: 'From vintage pianos to cutting-edge synthesizers',
    cta: 'Explore Keyboards',
    ctaLink: '/products?category=keyboards-synths',
    image: '🎹',
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
      className="relative bg-gradient-to-br from-purple-900 via-indigo-900 to-black text-white overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-96 h-96 bg-yellow-400 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-400 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-20 md:py-28 relative">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`transition-all duration-500 ${
              index === current 
                ? 'opacity-100 translate-x-0' 
                : 'opacity-0 absolute top-0 left-0 w-full translate-x-full'
            }`}
          >
            <div className="max-w-3xl">
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
            <div className="absolute right-0 top-1/2 -translate-y-1/2 text-9xl opacity-50 hidden lg:block">
              {slide.image}
            </div>
          </div>
        ))}

        {/* Navigation */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
          <button onClick={prev} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
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
              />
            ))}
          </div>
          <button onClick={next} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Update page.tsx**

Replace the hero section in page.tsx with:

```tsx
import { HeroCarousel } from "@/components/HeroCarousel";

// In the component, replace the existing hero section with:
<HeroCarousel />
```

---

### Task 4: Category Marquee

**Files:**
- Create: `src/components/CategoryMarquee.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create CategoryMarquee component**

```tsx
import Link from 'next/link';
import { Guitar, Music, Mic2, Drum, Headphones, Speakers, Cable, Wand2 } from 'lucide-react';

const categories = [
  { name: 'Guitars', icon: Guitar, href: '/products?category=guitars-basses', count: 245 },
  { name: 'Keyboards & Synths', icon: Music, href: '/products?category=keyboards-synths', count: 189 },
  { name: 'Drums & Percussion', icon: Drum, href: '/products?category=drums-percussion', count: 156 },
  { name: 'Studio Monitors', icon: Speakers, href: '/products?category=studio-monitors', count: 98 },
  { name: 'Audio Interfaces', icon: Mic2, href: '/products?category=audio-interfaces', count: 124 },
  { name: 'Microphones', icon: Mic2, href: '/products?category=microphones', count: 187 },
  { name: 'PA Systems', icon: Speakers, href: '/products?category=pa-systems', count: 76 },
  { name: 'Headphones', icon: Headphones, href: '/products?category=headphones', count: 143 },
  { name: 'Mixers', icon: Drum, href: '/products?category=mixers', count: 92 },
  { name: 'Amplifiers', icon: Speakers, href: '/products?category=amplifiers', count: 134 },
  { name: 'Effects Pedals', icon: Wand2, href: '/products?category=effects-pedals', count: 267 },
  { name: 'Cables & Accs', icon: Cable, href: '/products?category=cables-accessories', count: 312 },
];

export function CategoryMarquee() {
  return (
    <section className="py-8 bg-gray-50 border-y overflow-hidden">
      <div className="container mx-auto px-4 mb-4">
        <h2 className="text-lg font-semibold text-center">Shop by Category</h2>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        <div className="flex gap-4 animate-marquee">
          {[...categories, ...categories].map((category, index) => {
            const Icon = category.icon;
            return (
              <Link
                key={`${category.name}-${index}`}
                href={category.href}
                className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-white border rounded-full hover:border-purple-500 hover:text-yellow-600 transition-colors"
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium whitespace-nowrap">{category.name}</span>
                <span className="text-xs text-muted-foreground">({category.count})</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add CSS animation**

Add to globals.css:

```css
@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.animate-marquee {
  animation: marquee 30s linear infinite;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
```

- [ ] **Step 3: Add to page.tsx**

Import and use CategoryMarquee after the hero section.

---

### Task 5: ProductCard with Quick Actions

**Files:**
- Modify: `src/components/product/ProductCard.tsx`

- [ ] **Step 1: Upgrade ProductCard**

Add quick action buttons (add to cart, wishlist, quick view) that appear on hover:

```tsx
'use client';

import Link from 'next/link';
import { ShoppingCart, Heart, Eye, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/cart-context';
import { useWishlist } from '@/lib/wishlist-context';
import { ShippingBadge } from '@/components/shipping/ShippingBadge';

interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  price: number;
  originalPrice?: number;
  emoji: string;
  rating?: number;
  reviewCount?: number;
  shipsInDays?: number;
  twoDayEligible?: boolean;
  badges?: string[];
}

interface ProductCardProps {
  product: Product;
  showQuickActions?: boolean;
}

export function ProductCard({ product, showQuickActions = true }: ProductCardProps) {
  const { addItem } = useCart();
  const { isInWishlist, toggleItem } = useWishlist();
  const inWishlist = isInWishlist(product.slug);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.emoji,
      quantity: 1,
      slug: product.slug,
      brand: product.brand,
    });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.emoji,
      quantity: 1,
      slug: product.slug,
      brand: product.brand,
    });
  };

  return (
    <div className="group relative rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden hover:shadow-lg transition-all">
      <Link href={`/products/${product.slug}`}>
        <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 relative flex items-center justify-center p-4">
          <span className="text-7xl">{product.emoji}</span>
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {product.twoDayEligible && (
              <ShippingBadge shipsInDays={product.shipsInDays} twoDayEligible={product.twoDayEligible} />
            )}
            {product.badges?.map((badge) => (
              <span key={badge} className="bg-yellow-600 text-white text-xs font-bold px-2 py-1 rounded">
                {badge}
              </span>
            ))}
          </div>
          
          {/* Sale badge */}
          {product.originalPrice && product.originalPrice > product.price && (
            <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
            </div>
          )}
          
          {/* Quick Actions - appear on hover */}
          {showQuickActions && (
            <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
              <Button
                size="sm"
                className="flex-1 bg-white text-yellow-900 hover:bg-yellow-900 hover:text-white"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="w-4 h-4 mr-1" />
                Add
              </Button>
              <Button
                size="sm"
                variant={inWishlist ? 'default' : 'outline'}
                className={inWishlist ? 'bg-pink-500 hover:bg-pink-600' : 'bg-white'}
                onClick={handleWishlist}
              >
                <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
              </Button>
              <Link href={`/products/${product.slug}`}>
                <Button size="sm" variant="outline" className="bg-white">
                  <Eye className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-4">
        <p className="text-xs text-muted-foreground">{product.brand}</p>
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold mt-1 line-clamp-2 group-hover:text-yellow-600 transition-colors">
            {product.name}
          </h3>
        </Link>
        
        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-1 mt-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3 h-3 ${
                    star <= product.rating! ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            {product.reviewCount && (
              <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
            )}
          </div>
        )}
        
        {/* Price */}
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-lg font-bold">${product.price}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-sm text-muted-foreground line-through">
              ${product.originalPrice}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

### Task 6: MiniCart Drawer

**Files:**
- Create: `src/components/MiniCart.tsx`
- Modify: `src/lib/cart-context.tsx`

- [ ] **Step 1: Create MiniCart component**

```tsx
'use client';

import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import { Button } from '@/components/ui/button';

interface MiniCartProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MiniCart({ isOpen, onClose }: MiniCartProps) {
  const { items, updateQuantity, removeItem, subtotal } = useCart();

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 transition-opacity"
          onClick={onClose}
        />
      )}
      
      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              <h2 className="font-semibold">Your Cart</h2>
              <span className="text-sm text-muted-foreground">({items.length} items)</span>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-auto p-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">Your cart is empty</p>
                <p className="text-sm text-muted-foreground mt-1">Start shopping to add items</p>
                <Link href="/products" onClick={onClose}>
                  <Button className="mt-4">Browse Products</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-3xl">
                      {item.image}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium line-clamp-2">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">{item.brand}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                          <button
                            onClick={() => removeItem(item.productId)}
                            className="text-muted-foreground hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-4 border-t">
              <div className="flex justify-between mb-4">
                <span className="font-medium">Subtotal</span>
                <span className="font-bold text-lg">${subtotal.toFixed(2)}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Shipping and taxes calculated at checkout
              </p>
              <div className="space-y-2">
                <Link href="/checkout" onClick={onClose}>
                  <Button className="w-full">Checkout</Button>
                </Link>
                <Link href="/cart" onClick={onClose}>
                  <Button variant="outline" className="w-full">View Cart</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Integrate MiniCart with Header**

Add MiniCart state to header.tsx:

```tsx
const [miniCartOpen, setMiniCartOpen] = useState(false);

// Add to render:
<MiniCart isOpen={miniCartOpen} onClose={() => setMiniCartOpen(false)} />

// Update cart link to use button:
<Button variant="ghost" size="icon" onClick={() => setMiniCartOpen(true)}>
  <ShoppingCart className="h-5 w-5" />
  {totalItems > 0 && (...badge...)}
</Button>
```

---

### Task 7: Newsletter & Improved Footer

**Files:**
- Create: `src/components/Newsletter.tsx`
- Modify: `src/components/footer.tsx`

- [ ] **Step 1: Create Newsletter component**

```tsx
'use client';

import { useState } from 'react';
import { Mail, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  if (subscribed) {
    return (
      <div className="bg-yellow-900 text-white rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold">You're on the list!</h3>
        <p className="mt-2">Check your inbox for a special welcome offer.</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 text-white rounded-xl p-8">
      <div className="max-w-md mx-auto text-center">
        <Mail className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
        <h3 className="text-2xl font-bold">Get 10% Off Your First Order</h3>
        <p className="mt-2 text-yellow-200">
          Subscribe to our newsletter for exclusive deals, new arrivals, and music tips.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 flex gap-2">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-white/10 border-white/20 text-white placeholder:text-yellow-300"
          />
          <Button type="submit" className="bg-yellow-600 hover:bg-yellow-700">
            Subscribe
          </Button>
        </form>
        <p className="mt-3 text-xs text-yellow-300">
          We respect your privacy. Unsubscribe anytime.
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update Footer with newsletter and improved layout**

```tsx
import { Newsletter } from "./Newsletter";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Newsletter */}
        <div className="mb-12">
          <Newsletter />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Shop */}
          <div>
            <h3 className="font-semibold mb-4">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/products" className="text-muted-foreground hover:text-primary">All Products</Link></li>
              <li><Link href="/products?category=guitars-basses" className="text-muted-foreground hover:text-primary">Guitars & Basses</Link></li>
              <li><Link href="/products?category=keyboards-synths" className="text-muted-foreground hover:text-primary">Keyboards & Synths</Link></li>
              <li><Link href="/products?category=recording-gear" className="text-muted-foreground hover:text-primary">Recording Gear</Link></li>
              <li><Link href="/products?category=drums-percussion" className="text-muted-foreground hover:text-primary">Drums & Percussion</Link></li>
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/contact" className="text-muted-foreground hover:text-primary">Contact Us</Link></li>
              <li><Link href="/shipping" className="text-muted-foreground hover:text-primary">Shipping Info</Link></li>
              <li><Link href="/returns" className="text-muted-foreground hover:text-primary">Returns</Link></li>
              <li><Link href="/faq" className="text-muted-foreground hover:text-primary">FAQ</Link></li>
            </ul>
          </div>
          
          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="text-muted-foreground hover:text-primary">About Us</Link></li>
              <li><Link href="/careers" className="text-muted-foreground hover:text-primary">Careers</Link></li>
              <li><Link href="/press" className="text-muted-foreground hover:text-primary">Press</Link></li>
            </ul>
          </div>
          
          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-muted-foreground hover:text-primary">Terms of Service</Link></li>
              <li><Link href="/accessibility" className="text-muted-foreground hover:text-primary">Accessibility</Link></li>
            </ul>
          </div>
        </div>
        
        {/* Bottom */}
        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎵</span>
            <span className="font-bold">ElectroMuscial Store</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} ElectroMuscial Store. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-muted-foreground hover:text-primary">Facebook</a>
            <a href="#" className="text-muted-foreground hover:text-primary">Twitter</a>
            <a href="#" className="text-muted-foreground hover:text-primary">Instagram</a>
            <a href="#" className="text-muted-foreground hover:text-primary">YouTube</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
```

---

### Task 8: Dark Mode Support

**Files:**
- Modify: `src/app/globals.css`
- Create: `src/components/theme-provider.tsx` (optional)

- [ ] **Step 1: Add dark mode CSS variables**

Update globals.css with CSS variables for light/dark mode:

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.3%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.3%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.3%;
    --primary: 265 83% 58%;
    --primary-foreground: 0 0% 100%;
    --secondary: 220 9% 96%;
    --secondary-foreground: 222.2 84% 4.3%;
    --muted: 220 9% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 220 9% 96%;
    --accent-foreground: 222.2 84% 4.3%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 265 83% 58%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.3%;
    --foreground: 0 0% 98%;
    --card: 222.2 84% 4.3%;
    --card-foreground: 0 0% 98%;
    --popover: 222.2 84% 4.3%;
    --popover-foreground: 0 0% 98%;
    --primary: 265 83% 68%;
    --primary-foreground: 0 0% 100%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 0 0% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 265 83% 68%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

- [ ] **Step 2: Add dark mode toggle (optional - can add to header)**

```tsx
// Add to header.tsx:
import { Moon, Sun } from 'lucide-react';
const [darkMode, setDarkMode] = useState(false);

// Toggle button:
<Button
  variant="ghost"
  size="icon"
  onClick={() => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark', !darkMode);
  }}
>
  {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
</Button>
```

---

### Task 9: Skeleton Loader

**Files:**
- Create: `src/components/ui/skeleton.tsx`

- [ ] **Step 1: Create Skeleton component**

```tsx
import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export { Skeleton };
```

- [ ] **Step 2: Create ProductCardSkeleton**

```tsx
import { Skeleton } from "./skeleton";

export function ProductCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-4">
      <Skeleton className="aspect-square rounded-lg" />
      <Skeleton className="h-4 w-20 mt-4" />
      <Skeleton className="h-5 w-full mt-2" />
      <Skeleton className="h-5 w-2/3 mt-2" />
      <Skeleton className="h-6 w-24 mt-4" />
    </div>
  );
}
```

---

## Execution

**Plan complete. Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**