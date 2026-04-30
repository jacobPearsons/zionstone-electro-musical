'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

const menuCategories = [
  {
    name: 'Guitars & Basses',
    href: '/products?category=guitars-basses',
    items: ['Electric Guitars', 'Acoustic Guitars', 'Bass Guitars', 'Guitar Packages'],
    brands: ['Fender', 'Gibson', 'Ibanez', 'PRS'],
  },
  {
    name: 'Keyboards & Synths',
    href: '/products?category=keyboards-synths',
    items: ['Digital Pianos', 'Synthesizers', 'MIDI Controllers', 'Workstations'],
    brands: ['Yamaha', 'Roland', 'Korg', 'Nord'],
  },
  {
    name: 'Recording Gear',
    href: '/products?category=recording-gear',
    items: ['Audio Interfaces', 'Microphones', 'Studio Monitors', 'Preamps'],
    brands: ['Focusrite', 'Shure', 'Mackie', 'Audio-Technica'],
  },
  {
    name: 'Drums & Percussion',
    href: '/products?category=drums-percussion',
    items: ['Electronic Drums', 'Acoustic Drums', 'Cymbals', 'Hardware'],
    brands: ['Roland', 'Yamaha', 'Pearl', 'Zildjian'],
  },
];

export function MegaMenu() {
  return (
    <div className="absolute top-full left-0 w-full bg-white border shadow-xl z-40 hidden group-hover:block animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-4 gap-8">
          {menuCategories.map((category) => (
            <div key={category.name}>
              <Link 
                href={category.href}
                className="font-semibold text-yellow-600 mb-3 hover:text-yellow-700 block"
              >
                {category.name}
              </Link>
              <ul className="space-y-2">
                {category.items.map((item) => (
                  <li key={item}>
                    <Link 
                      href={`${category.href}`}
                      className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
                    >
                      <ChevronRight className="w-3 h-3 opacity-50" />
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
                      className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
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