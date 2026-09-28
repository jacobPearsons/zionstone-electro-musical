'use client';

import { Truck, Zap, Rocket } from 'lucide-react';
import type { ShippingMethod } from '@/types/shipping';
import { formatDeliveryDate } from '@/lib/shipping';
import { formatPrice } from '@/lib/utils';

interface ShippingSelectorProps {
  methods: ShippingMethod[];
  estimatedDeliveryDates: Record<string, string>;
  selectedMethodId: string;
  onSelect: (method: ShippingMethod) => void;
  className?: string;
}

const METHOD_ICONS: Record<string, React.ElementType> = {
  std: Truck,
  exp: Zap,
  overn: Rocket,
};

export function ShippingSelector({
  methods,
  estimatedDeliveryDates,
  selectedMethodId,
  onSelect,
  className = '',
}: ShippingSelectorProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="text-sm font-medium text-foreground">Shipping Method</h3>
      
      {methods.map((method) => {
        const Icon = METHOD_ICONS[method.id] || Truck;
        const deliveryDate = estimatedDeliveryDates[method.id];
        const isSelected = selectedMethodId === method.id;
        
        return (
          <label
            key={method.id}
            className={`relative flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
              isSelected
                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                : 'border-border hover:border-foreground/20'
            }`}
          >
            <input
              type="radio"
              name="shipping-method"
              value={method.id}
              checked={isSelected}
              onChange={() => onSelect(method)}
              className="sr-only"
            />
            
            <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              isSelected ? 'border-primary' : 'border-foreground/30'
            }`}>
              {isSelected && (
                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium text-foreground">{method.name}</span>
                {method.isTwoDayEligible && (
                  <span className="text-xs px-1.5 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 rounded">
                    2-Day
                  </span>
                )}
              </div>
              
              {deliveryDate && (
                <p className="text-sm text-muted-foreground mt-1">
                  Arrives by {formatDeliveryDate(deliveryDate)}
                </p>
              )}
            </div>
            
            <span className="text-sm font-semibold text-foreground">
              {formatPrice(method.price)}
            </span>
          </label>
        );
      })}
    </div>
  );
}
