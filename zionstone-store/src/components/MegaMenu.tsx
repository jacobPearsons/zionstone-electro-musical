'use client';

import Link from 'next/link';
import { CATEGORIES, brandsInCategory } from '@/data/categories';

export function MegaMenu() {
  return (
    <div className="absolute top-full left-0 w-full z-40 hidden border-b border-border bg-popover text-popover-foreground group-hover:block animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="container mx-auto px-4 py-8">
        <nav aria-label="Product categories" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {CATEGORIES.map(category => {
            const brands = brandsInCategory(category.slug);
            return (
              <div key={category.slug}>
                <Link
                  href={category.href}
                  className="block text-sm font-semibold tracking-tight text-primary-strong transition-colors duration-150 hover:text-primary-strong/80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {category.name}
                </Link>
                <p className="mt-1 text-xs tabular-nums text-muted-foreground">
                  {category.count} {category.count === 1 ? 'product' : 'products'}
                </p>
                {category.description && (
                  <p className="mt-2 text-xs text-muted-foreground">{category.description}</p>
                )}
                {brands.length > 0 && (
                  <div className="mt-3 border-t border-border pt-3">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Brands stocked
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {brands.map(brand => brand.name).join(', ')}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
