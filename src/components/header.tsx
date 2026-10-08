'use client';

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { ShoppingCart, Menu, X, Heart, User, Search, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import { CATEGORIES } from "@/data/categories";
import { SearchBar } from "./SearchBar";
import { MegaMenu } from "./MegaMenu";

/**
 * The key the pre-paint script in `src/app/layout.tsx` reads. The stored value
 * is exactly `'dark'` or `'light'`; when the key is absent the OS preference
 * wins. `readCurrentTheme` mirrors that script exactly, so the button and the
 * canvas can never disagree.
 */
const THEME_STORAGE_KEY = 'theme';

function readCurrentTheme(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored) return stored === 'dark';
  } catch {
    // Storage blocked (private mode, third-party context): follow the OS.
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  // Seeded to false so the server and first client render agree; the effect
  // below replaces it with the truth the pre-paint script already applied.
  const [darkMode, setDarkMode] = React.useState(false);
  const { totalItems } = useCart();
  const { totalItems: wishlistCount } = useWishlist();

  // Seeded on mount from the same key the pre-paint script reads, and kept in
  // step with the OS only while the customer has made no explicit choice, so
  // the icon always reflects the live theme.
  React.useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const hasExplicitChoice = () => {
      try {
        return window.localStorage.getItem(THEME_STORAGE_KEY) !== null;
      } catch {
        return false;
      }
    };
    setDarkMode(readCurrentTheme());
    const onSystemChange = () => {
      if (!hasExplicitChoice()) setDarkMode(media.matches);
    };
    media.addEventListener('change', onSystemChange);
    return () => media.removeEventListener('change', onSystemChange);
  }, []);

  // The DOM class is the source of truth for "what is on screen right now",
  // which keeps this correct even if something else toggles it.
  const toggleDarkMode = () => {
    const next = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', next);
    setDarkMode(next);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next ? 'dark' : 'light');
    } catch {
      // Nothing to persist to; the class still applies for this page view.
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Logo + Nav */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative h-10 w-32">
                <Image
                  src="/brand/logo.png"
                  alt="ElectroMusical Store"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>
            
            {/* Desktop Navigation with Mega Menu */}
            <nav className="hidden lg:flex items-center gap-6 relative group">
              {CATEGORIES.map((category) => (
                <Link
                  key={category.slug}
                  href={category.href}
                  className="relative rounded-sm text-sm font-medium text-muted-foreground transition-colors duration-150 after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-primary after:transition-transform after:duration-150 hover:text-foreground hover:after:scale-x-100 focus-visible:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:after:scale-x-100"
                >
                  {category.name}
                </Link>
              ))}
              <MegaMenu />
              <Link
                href="/contact"
                className="relative rounded-sm text-sm font-medium text-muted-foreground transition-colors duration-150 after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-primary after:transition-transform after:duration-150 hover:text-foreground hover:after:scale-x-100 focus-visible:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:after:scale-x-100"
              >
                Contact
              </Link>
            </nav>
          </div>

          {/* Center: Search */}
          <SearchBar />

          {/* Right: Icons */}
          <div className="flex items-center gap-1">
            {/* Dark mode toggle */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              aria-pressed={darkMode}
              className="hidden text-muted-foreground transition-colors duration-150 hover:text-foreground sm:flex"
            >
              {darkMode ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
            </Button>

            {/* Wishlist */}
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="relative hidden text-muted-foreground transition-colors duration-150 hover:text-foreground sm:flex"
            >
              <Link href="/dashboard?tab=wishlist" aria-label="Wishlist">
                <Heart className="h-5 w-5" aria-hidden="true" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    {wishlistCount}
                  </span>
                )}
              </Link>
            </Button>

            {/* Cart */}
            <Button asChild variant="ghost" size="icon" className="relative text-muted-foreground transition-colors duration-150 hover:text-foreground">
              <Link href="/cart" aria-label={`Cart, ${totalItems} ${totalItems === 1 ? 'item' : 'items'}`}>
                <ShoppingCart className="h-5 w-5" aria-hidden="true" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    {totalItems}
                  </span>
                )}
              </Link>
            </Button>

            {/* User Menu */}
            <SignedIn>
              <Button asChild variant="ghost" size="sm" className="hidden gap-2 text-muted-foreground transition-colors duration-150 hover:text-foreground lg:block">
                <Link href="/dashboard">
                  <User className="h-4 w-4" />
                  Account
                </Link>
              </Button>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            
            <SignedOut>
              <div className="hidden items-center gap-2 lg:flex">
                <Button asChild variant="ghost" size="sm" className="text-muted-foreground transition-colors duration-150 hover:text-foreground">
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button asChild size="sm" className="bg-primary text-primary-foreground transition-colors duration-150 hover:bg-primary/90">
                  <Link href="/sign-up">Sign Up</Link>
                </Button>
              </div>
            </SignedOut>

            {/* Mobile Search */}
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground transition-colors duration-150 hover:text-foreground md:hidden"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Search products"
              aria-expanded={searchOpen}
            >
              <Search className="h-5 w-5" aria-hidden="true" />
            </Button>

            {/* Mobile Menu */}
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground transition-colors duration-150 hover:text-foreground lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
            </Button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {searchOpen && (
          <div className="border-t border-border py-3 md:hidden">
            <div className="relative">
              <input
                type="text"
                placeholder="Search instruments, gear..."
                className="h-10 w-full rounded-full border border-input bg-background pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:ring-2 focus:ring-ring"
                autoFocus
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="border-t border-border py-4 lg:hidden">
            <div className="flex flex-col gap-1">
              <Link href="/products" className="flex items-center justify-between rounded-sm py-2 text-sm font-medium text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground">All products</Link>
              {CATEGORIES.map((category) => (
                <Link
                  key={category.slug}
                  href={category.href}
                  className="flex items-center justify-between rounded-sm py-2 text-sm font-medium text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
                >
                  {category.name}
                  <span className="text-xs tabular-nums text-muted-foreground">{category.count}</span>
                </Link>
              ))}
              <Link href="/contact" className="flex items-center justify-between rounded-sm py-2 text-sm font-medium text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground">Contact</Link>
              <div className="mt-3 border-t border-border pt-3">
                <SignedOut>
                  <Link href="/sign-in" className="flex items-center rounded-sm py-2 text-sm font-medium text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground">Sign In</Link>
                </SignedOut>
                <SignedIn>
                  <Link href="/dashboard" className="flex items-center rounded-sm py-2 text-sm font-medium text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground">Dashboard</Link>
                  <Link href="/dashboard?tab=wishlist" className="flex items-center gap-2 rounded-sm py-2 text-sm font-medium text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground">
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