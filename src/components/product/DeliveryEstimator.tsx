'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Truck, Check, Loader2 } from 'lucide-react';

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
        date: new Date(Date.now() + 3 * 86400000).toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
        }),
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
    <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Truck className="w-4 h-4" />
        <span className="text-black">Delivery Estimate</span>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Enter ZIP code"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
          maxLength={5}
          className="flex-1"
        />
        <Button
          onClick={handleEstimate}
          disabled={zipCode.length < 5 || loading}
          variant="secondary"
          size="sm"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Check'}
        </Button>
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {estimate && estimate.available && (
        <div className="flex items-start gap-2 text-sm text-green-600">
          <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">
              {estimate.cost === 0 ? 'FREE' : `$${estimate.cost.toFixed(2)}`} delivery by {estimate.date}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}