'use client';

import Link from 'next/link';
import { Briefcase, ArrowUpFromLine, ShoppingBag, Cable, Wrench } from 'lucide-react';
import { getCompatibleCount } from '@/data/products';
import { CATEGORY_SLUGS } from '@/data/categories';
import type { CompatibilityCategory } from '@/data/products';

interface CompatibilityCheckerProps {
  compatibility?: CompatibilityCategory[];
  productSlug: string;
  productCategory: string;
}

const categoryConfig: Record<CompatibilityCategory, { icon: React.ReactNode; label: string }> = {
  cases: { icon: <Briefcase className="w-4 h-4" />, label: 'Cases' },
  stands: { icon: <ArrowUpFromLine className="w-4 h-4" />, label: 'Stands' },
  bags: { icon: <ShoppingBag className="w-4 h-4" />, label: 'Bags' },
  cables: { icon: <Cable className="w-4 h-4" />, label: 'Cables' },
  accessories: { icon: <Wrench className="w-4 h-4" />, label: 'Accessories' },
};

export function CompatibilityChecker({ compatibility, productSlug, productCategory }: CompatibilityCheckerProps) {
  if (!compatibility || compatibility.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold tracking-tight">Compatible With</h3>
      <div className="flex flex-wrap gap-2">
        {compatibility.map((cat) => {
          const config = categoryConfig[cat];
          // `cases` / `stands` / `bags` / `cables` / `accessories` are accessory
          // types, not catalogue categories: no product sits in them, so a link
          // would land on an unfiltered grid and a count would always read 0.
          // Link only when the value really is a category slug, so the chip
          // becomes navigable the moment such a category is stocked.
          const isCategory = CATEGORY_SLUGS.has(cat);
          const count = isCategory ? getCompatibleCount(cat, productCategory) : 0;

          const chip = (
            <>
              <span aria-hidden="true">{config.icon}</span>
              <span className="text-sm">{config.label}</span>
              {count > 0 && <span className="text-xs tabular-nums text-muted-foreground">({count})</span>}
            </>
          );

          return isCategory ? (
            <Link
              key={cat}
              href={`/products?category=${encodeURIComponent(cat)}&compatible=${encodeURIComponent(productSlug)}`}
              className="flex items-center gap-2 rounded-full border border-border px-3 py-2 transition-colors duration-200 ease-out hover:border-primary hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {chip}
            </Link>
          ) : (
            <span
              key={cat}
              className="flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-2 text-foreground"
            >
              {chip}
            </span>
          );
        })}
      </div>
    </div>
  );
}
