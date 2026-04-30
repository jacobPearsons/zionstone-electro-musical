'use client';

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { ShoppingCart, Menu, X, Heart, User, Search, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import { SearchBar } from "./SearchBar";
import { MegaMenu } from "./MegaMenu";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [darkMode, setDarkMode] = React.useState(false);
  const { totalItems } = useCart();
  const { totalItems: wishlistCount } = useWishlist();

  const categories = [
    { name: 'Guitars & Basses', href: '/products?category=guitars-basses' },
    { name: 'Keyboards & Synths', href: '/products?category=keyboards-synths' },
    { name: 'Recording Gear', href: '/products?category=recording-gear' },
    { name: 'Drums & Percussion', href: '/products?category=drums-percussion' },
  ];

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.documentElement.classList.toggle('dark', newMode);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
            {/* Dark mode toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="hidden sm:flex"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {/* Wishlist */}
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

            {/* Cart */}
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

            {/* User Menu */}
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

            {/* Mobile Search */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Mobile Menu */}
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

        {/* Mobile Search Bar */}
        {searchOpen && (
          <div className="md:hidden py-3 border-t">
            <div className="relative">
              <input
                type="text"
                placeholder="Search instruments, gear..."
                className="w-full pl-10 pr-10 py-2 border rounded-lg bg-background"
                autoFocus
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        )}

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