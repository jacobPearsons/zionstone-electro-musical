'use client';

import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuantityStepperProps {
  quantity: number;
  onChange: (quantity: number) => void;
  min?: number;
  max?: number;
}

export function QuantityStepper({ 
  quantity, 
  onChange, 
  min = 1, 
  max = 99 
}: QuantityStepperProps) {
  const decrease = () => {
    if (quantity > min) {
      onChange(quantity - 1);
    }
  };

  const increase = () => {
    if (quantity < max) {
      onChange(quantity + 1);
    }
  };

  const handleInputChange = (value: string) => {
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed)) {
      onChange(Math.min(max, Math.max(min, parsed)));
    }
  };

  return (
    <div className="flex items-center border rounded-lg overflow-hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={decrease}
        disabled={quantity <= min}
        className="border-r rounded-none px-3"
      >
        <Minus className="w-4 h-4" />
      </Button>
      <input
        type="number"
        value={quantity}
        onChange={(e) => handleInputChange(e.target.value)}
        min={min}
        max={max}
        className="w-16 text-center border-0 py-2 font-medium focus:outline-none focus:ring-0"
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={increase}
        disabled={quantity >= max}
        className="border-l rounded-none px-3"
      >
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  );
}