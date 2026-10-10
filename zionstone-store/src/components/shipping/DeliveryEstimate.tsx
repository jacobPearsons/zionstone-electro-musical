'use client';

import { Calendar } from 'lucide-react';
import { formatDeliveryDate } from '@/lib/shipping';

interface DeliveryEstimateProps {
  estimatedDelivery: string;
  shippingMethodName: string;
  className?: string;
}

export function DeliveryEstimate({ estimatedDelivery, shippingMethodName, className = '' }: DeliveryEstimateProps) {
  const deliveryDate = new Date(estimatedDelivery);
  const formattedDate = formatDeliveryDate(estimatedDelivery);
  const today = new Date();
  const daysUntilDelivery = Math.ceil((deliveryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  return (
    // §3.7: the icon well is `bg-muted`, not a brand tint — the callout's own
    // surface is already `bg-muted`, so the well is kept for its geometry rather
    // than its fill. Gold is spent once here, on the delivery date, which is the
    // one thing on this callout the customer is actually reading.
    <div className={`flex items-start gap-3 p-3 bg-muted border border-border rounded-lg ${className}`}>
      <div className="flex-shrink-0 w-10 h-10 bg-muted rounded-full flex items-center justify-center">
        <Calendar className="w-5 h-5 text-foreground" aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">
          Arrives by <span className="text-primary-strong">{formattedDate}</span>
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {shippingMethodName} • {daysUntilDelivery} days
        </p>
      </div>
    </div>
  );
}
