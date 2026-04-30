'use client';

import { Check } from 'lucide-react';

interface VariantSelectorProps {
  name: string;
  variants: string[];
  selected: string;
  onChange: (variant: string) => void;
  soldOutVariants?: string[];
}

export function VariantSelector({ 
  name, 
  variants, 
  selected, 
  onChange,
  soldOutVariants = [] 
}: VariantSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{name}</span>
        {selected && (
          <span className="text-sm text-muted-foreground">Selected: {selected}</span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => {
          const isSelected = selected === variant;
          const isSoldOut = soldOutVariants.includes(variant);
          
          return (
            <button
              key={variant}
              onClick={() => !isSoldOut && onChange(variant)}
              disabled={isSoldOut}
              className={`px-4 py-2 rounded-lg border-2 transition-all ${
                isSelected 
                  ? 'border-purple-600 bg-yellow-50 text-yellow-700' 
                  : isSoldOut
                    ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              <span className="flex items-center gap-2">
                {variant}
                {isSelected && <Check className="w-4 h-4 text-yellow-600" />}
                {isSoldOut && <span className="text-xs text-red-500">(Sold Out)</span>}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface ColorVariant {
  name: string;
  hex: string;
}

interface ColorSelectorProps {
  colors: ColorVariant[];
  selected: string;
  onChange: (color: string) => void;
}

export function ColorSelector({ colors, selected, onChange }: ColorSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Color</span>
        {selected && (
          <span className="text-sm text-muted-foreground">
            {colors.find(c => c.name === selected)?.name}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => {
          const isSelected = selected === color.name;
          
          return (
            <button
              key={color.name}
              onClick={() => onChange(color.name)}
              className={`w-10 h-10 rounded-full border-2 transition-all ${
                isSelected 
                  ? 'border-purple-600 ring-2 ring-purple-200' 
                  : 'border-gray-200 hover:border-purple-300'
              }`}
              style={{ backgroundColor: color.hex }}
              title={color.name}
              aria-label={`Select ${color.name} color`}
            />
          );
        })}
      </div>
    </div>
  );
}