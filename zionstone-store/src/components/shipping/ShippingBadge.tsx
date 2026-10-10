'use client';

import { CheckCircle, Truck } from 'lucide-react';

interface ShippingBadgeProps {
  shipsInDays: number;
  twoDayEligible: boolean;
  className?: string;
}

export function ShippingBadge({ shipsInDays, twoDayEligible, className = '' }: ShippingBadgeProps) {
  if (twoDayEligible && shipsInDays <= 2) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 text-xs font-medium rounded ${className}`}>
        <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />
        <span>Ships in 2 Days</span>
      </div>
    );
  }
  
  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 bg-muted text-muted-foreground text-xs font-medium rounded ${className}`}>
      <Truck className="w-3.5 h-3.5" aria-hidden="true" />
      <span>Ships in {shipsInDays} Days</span>
    </div>
  );
}
