'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Truck, Check, Loader2 } from 'lucide-react';
import { formatDeliveryDate } from '@/lib/shipping';
import { formatPrice } from '@/lib/utils';

interface DeliveryEstimatorProps {
  productId?: string;
}

export function DeliveryEstimator({ productId }: DeliveryEstimatorProps) {
  const [zipCode, setZipCode] = useState('');
  const [estimate, setEstimate] = useState<{
    date: string;
    cost: number;
    available: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEstimate = async () => {
    if (zipCode.length < 5) {
      setError('Please enter a valid 5-digit ZIP code');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setEstimate({
        date: new Date(Date.now() + 3 * 86400000).toISOString(),
        cost: 0,
        available: true,
      });
    } catch {
      setError('Unable to calculate delivery. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 p-4 bg-muted rounded-2xl">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Truck className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
        <span>Delivery Estimate</span>
      </div>

      <div className="flex gap-2">
        <label htmlFor="delivery-zip" className="sr-only">
          ZIP code
        </label>
        <Input
          id="delivery-zip"
          placeholder="Enter ZIP code"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
          maxLength={5}
          inputMode="numeric"
          autoComplete="postal-code"
          className="flex-1"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'delivery-zip-error' : undefined}
        />
        <Button
          onClick={handleEstimate}
          disabled={zipCode.length < 5 || loading}
          variant="secondary"
          size="sm"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : 'Check'}
        </Button>
      </div>

      {error && (
        <p id="delivery-zip-error" role="alert" className="text-sm text-destructive">{error}</p>
      )}

      {estimate && estimate.available && (
        <div role="status" className="flex items-start gap-2 text-sm text-emerald-600 dark:text-emerald-400">
          <Check className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <div>
            <p className="font-medium">
              {estimate.cost === 0 ? 'FREE' : formatPrice(estimate.cost)} delivery by {formatDeliveryDate(estimate.date)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}