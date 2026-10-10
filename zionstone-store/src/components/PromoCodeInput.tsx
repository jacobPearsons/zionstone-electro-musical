'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tag, Check, X } from 'lucide-react';
import { findPromoCode, promoDiscount, type PromoCode } from '@/lib/promo-codes';
import { formatPrice } from '@/lib/utils';

interface PromoCodeInputProps {
  /**
   * Reports the code that is in force, not a pre-computed amount: the cart
   * owns the subtotal and re-derives the money with `promoDiscount`, so the
   * discount follows quantity changes instead of freezing at apply time.
   * `null` means no code is applied.
   */
  onApply?: (promo: PromoCode | null) => void;
  /** Live merchandise subtotal, used only to show the saving next to the rate. */
  subtotal?: number;
}

export function PromoCodeInput({ onApply, subtotal = 0 }: PromoCodeInputProps) {
  const [code, setCode] = useState('');
  const [applied, setApplied] = useState<PromoCode | null>(null);
  const [error, setError] = useState('');

  // Derived from the live subtotal, so changing a quantity updates the saving.
  const saving = promoDiscount(applied, subtotal);

  const handleApply = () => {
    const match = findPromoCode(code);
    if (!match) {
      setError('That promo code is not valid. Check the code and try again.');
      return;
    }
    setError('');
    setApplied(match);
    onApply?.(match);
  };

  const handleRemove = () => {
    setApplied(null);
    setCode('');
    setError('');
    onApply?.(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Tag className="w-4 h-4" aria-hidden="true" />
        <span>Promo Code</span>
      </div>

      {applied ? (
        <div
          role="status"
          className="flex items-center justify-between gap-2 p-3 bg-primary/10 border border-primary/20 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0 text-primary" aria-hidden="true" />
            <span className="text-sm font-semibold tracking-tight text-foreground">
              {applied.code} applied{' '}
              <span className="text-primary-strong">(-{applied.percent}%)</span>
              {saving > 0 && (
                <span className="font-normal text-muted-foreground">
                  {' '}
                  saves {formatPrice(saving)}
                </span>
              )}
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleRemove} aria-label={`Remove promo code ${applied.code}`}>
            <X className="w-4 h-4" aria-hidden="true" />
          </Button>
        </div>
      ) : (
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (code.trim()) handleApply();
          }}
        >
          <Input
            placeholder="Enter code"
            aria-label="Promo code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="flex-1"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? 'promo-code-error' : undefined}
          />
          <Button type="submit" variant="secondary" disabled={!code.trim()}>
            Apply
          </Button>
        </form>
      )}

      {error && (
        <p id="promo-code-error" role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
