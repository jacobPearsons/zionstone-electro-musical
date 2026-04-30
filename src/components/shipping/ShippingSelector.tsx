'use client';

import { Truck, Zap, Rocket } from 'lucide-react';
import type { ShippingMethod } from '@/types/shipping';
import { formatDeliveryDate } from '@/lib/shipping';

interface ShippingSelectorProps {
  methods: ShippingMethod[];
  estimatedDeliveryDates: Record<string, Date>;
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
      <h3 className="text-sm font-medium text-white">Shipping Method</h3>
      
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
                : 'border-gray-200 hover:border-gray-300'
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
              isSelected ? 'border-primary' : 'border-gray-300'
            }`}>
              {isSelected && (
                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-white" />
                <span className="font-medium text-white">{method.name}</span>
                {method.isTwoDayEligible && (
                  <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded">
                    2-Day
                  </span>
                )}
              </div>
              
              {deliveryDate && (
                <p className="text-sm text-white mt-1">
                  Arrives by {formatDeliveryDate(deliveryDate)}
                </p>
              )}
            </div>
            
            <span className="text-sm font-semibold text-white">
              ${method.price.toFixed(2)}
            </span>
          </label>
        );
      })}
    </div>
  );
}
