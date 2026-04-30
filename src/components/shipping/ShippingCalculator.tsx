'use client';

import { useState } from 'react';
import { MapPin, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { calculateShipping, formatDeliveryDate } from '@/lib/shipping';
import type { ShippingMethod } from '@/types/shipping';

interface ShippingCalculatorProps {
  onCalculate: (method: ShippingMethod, deliveryDate: Date) => void;
  className?: string;
}

export function ShippingCalculator({ onCalculate, className = '' }: ShippingCalculatorProps) {
  const [zipCode, setZipCode] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<ShippingMethod | null>(null);
  
  const handleCalculate = () => {
    if (zipCode.length === 5 && /^\d+$/.test(zipCode)) {
      setIsValid(true);
      setShowOptions(true);
    } else {
      setIsValid(false);
    }
  };
  
  const handleMethodSelect = (method: ShippingMethod) => {
    setSelectedMethod(method);
  };
  
  const handleApply = () => {
    if (selectedMethod) {
      const calculation = calculateShipping(zipCode);
      const deliveryDate = calculation.estimatedDeliveryDates[selectedMethod.id];
      onCalculate(selectedMethod, deliveryDate);
    }
  };
  
  if (showOptions && isValid) {
    const calculation = calculateShipping(zipCode);
    
    return (
      <div className={`p-4 border border-gray-200 rounded-lg bg-white ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium">Shipping to {zipCode}</span>
          <Check className="w-4 h-4 text-green-500" />
        </div>
        
        <div className="space-y-2 mb-4">
          {calculation.methods.map((method) => {
            const deliveryDate = calculation.estimatedDeliveryDates[method.id];
            const isSelected = selectedMethod?.id === method.id;
            
            return (
              <label
                key={method.id}
                className={`flex items-center justify-between p-3 border rounded cursor-pointer transition-colors ${
                  isSelected ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="calc-method"
                    checked={isSelected}
                    onChange={() => handleMethodSelect(method)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? 'border-primary' : 'border-gray-300'
                  }`}>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{method.name}</p>
                    {deliveryDate && (
                      <p className="text-xs text-gray-500">
                        Arrives {formatDeliveryDate(deliveryDate)}
                      </p>
                    )}
                  </div>
                </div>
                <span className="font-medium">${method.price.toFixed(2)}</span>
              </label>
            );
          })}
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowOptions(false)} className="flex-1">
            Change ZIP
          </Button>
          <Button onClick={handleApply} disabled={!selectedMethod} className="flex-1">
            Apply
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`p-4 border border-gray-200 rounded-lg bg-white ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Calculate Shipping
      </label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Enter ZIP code"
            value={zipCode}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 5);
              setZipCode(value);
              setIsValid(null);
            }}
            className={`pl-9 ${isValid === false ? 'border-red-500' : ''}`}
          />
        </div>
        <Button onClick={handleCalculate} disabled={zipCode.length !== 5}>
          Calculate
        </Button>
      </div>
      {isValid === false && (
        <p className="text-xs text-red-500 mt-1">Please enter a valid 5-digit ZIP code</p>
      )}
    </div>
  );
}
