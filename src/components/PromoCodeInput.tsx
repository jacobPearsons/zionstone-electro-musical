'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tag, Check, X } from 'lucide-react';

interface PromoCodeInputProps {
  onApply?: (discount: number) => void;
}

export function PromoCodeInput({ onApply }: PromoCodeInputProps) {
  const [code, setCode] = useState('');
  const [applied, setApplied] = useState<{ code: string; discount: number } | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError('');

    await new Promise(resolve => setTimeout(resolve, 600));

    if (code.toUpperCase() === 'SAVE20') {
      setApplied({ code: code.toUpperCase(), discount: 20 });
      onApply?.(20);
    } else if (code.toUpperCase() === 'SAVE10') {
      setApplied({ code: code.toUpperCase(), discount: 10 });
      onApply?.(10);
    } else {
      setError('Invalid promo code');
    }
    setLoading(false);
  };

  const handleRemove = () => {
    setApplied(null);
    setCode('');
    setError('');
    onApply?.(0);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Tag className="w-4 h-4" />
        <span>Promo Code</span>
      </div>

      {applied ? (
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600" />
            <span className="font-medium text-green-700">
              {applied.code} applied (-${applied.discount})
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleRemove}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Input
            placeholder="Enter code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
          />
          <Button
            variant="secondary"
            onClick={handleApply}
            disabled={loading || !code.trim()}
          >
            {loading ? '...' : 'Apply'}
          </Button>
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}