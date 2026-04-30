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
      <div className={`inline-flex items-center gap-1.5 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-medium rounded ${className}`}>
        <CheckCircle className="w-3.5 h-3.5" />
        <span>Ships in 2 Days</span>
      </div>
    );
  }
  
  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium rounded ${className}`}>
      <Truck className="w-3.5 h-3.5" />
      <span>Ships in {shipsInDays} Days</span>
    </div>
  );
}
