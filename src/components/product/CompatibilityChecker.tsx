'use client';

import Link from 'next/link';
import { Briefcase, ArrowUpFromLine, ShoppingBag, Cable, Wrench } from 'lucide-react';
import { getCompatibleCount } from '@/data/products';
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
      <h3 className="font-semibold">Compatible With</h3>
      <div className="flex flex-wrap gap-2">
        {compatibility.map((cat) => {
          const count = getCompatibleCount(cat, productCategory);
          const config = categoryConfig[cat];
          
          return (
            <Link
              key={cat}
              href={`/products?category=${cat}&compatible=${productSlug}`}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border hover:border-purple-500 hover:bg-yellow-50 transition-colors"
            >
              {config.icon}
              <span className="text-sm">{config.label}</span>
              <span className="text-xs text-muted-foreground">({count})</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
