'use client';

import { useState } from 'react';
import { Mail, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSubscribed(true);
    setEmail('');
    setLoading(false);
  };

  if (subscribed) {
    return (
      <div className="bg-secondary text-secondary-foreground rounded-2xl p-8 text-center">
        {/* §5 "Newsletter sent": the `Check` takes the accent, not a solid
            `bg-primary` disc. `bg-secondary-foreground/10` is this card's own
            neutral-well idiom (the `Input` below uses the same pair), so it
            reads on `bg-secondary` in both themes. */}
        <div className="w-16 h-16 bg-secondary-foreground/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-primary-strong" />
        </div>
        <h3 className="text-2xl font-semibold tracking-tight">You&apos;re on the list!</h3>
        <p className="mt-2 text-secondary-foreground/80">Check your inbox for a special welcome offer.</p>
      </div>
    );
  }

  return (
    <div className="bg-secondary text-secondary-foreground rounded-2xl p-8">
      <div className="max-w-md mx-auto text-center">
        <Mail className="w-12 h-12 mx-auto mb-4 text-primary" />
        <h3 className="text-2xl font-semibold tracking-tight">Get 10% Off Your First Order</h3>
        <p className="mt-2 text-secondary-foreground/80">
          Subscribe to our newsletter for exclusive deals, new arrivals, and music tips.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col sm:flex-row gap-2">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-secondary-foreground/10 border-secondary-foreground/20 text-secondary-foreground placeholder:text-secondary-foreground/50"
          />
          <Button 
            type="submit" 
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={loading}
          >
            {loading ? 'Subscribing...' : 'Subscribe'}
          </Button>
        </form>
        <p className="mt-3 text-xs text-secondary-foreground/60">
          We respect your privacy. Unsubscribe anytime.
        </p>
      </div>
    </div>
  );
}