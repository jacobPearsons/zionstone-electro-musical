'use client';

import { Calendar } from 'lucide-react';
import { formatDeliveryDate } from '@/lib/shipping';

interface DeliveryEstimateProps {
  estimatedDelivery: Date;
  shippingMethodName: string;
  className?: string;
}

export function DeliveryEstimate({ estimatedDelivery, shippingMethodName, className = '' }: DeliveryEstimateProps) {
  const formattedDate = formatDeliveryDate(estimatedDelivery);
  const today = new Date();
  const daysUntilDelivery = Math.ceil((estimatedDelivery.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  return (
    <div className={`flex items-start gap-3 p-3 bg-blue-50 rounded-lg ${className}`}>
      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
        <Calendar className="w-5 h-5 text-blue-600" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-900">
          Arrives by <span className="text-blue-600">{formattedDate}</span>
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          {shippingMethodName} • {daysUntilDelivery} days
        </p>
      </div>
    </div>
  );
}
