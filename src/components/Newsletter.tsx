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
      <div className="bg-yellow-900 text-white rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold">You&apos;re on the list!</h3>
        <p className="mt-2">Check your inbox for a special welcome offer.</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 text-white rounded-xl p-8">
      <div className="max-w-md mx-auto text-center">
        <Mail className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
        <h3 className="text-2xl font-bold">Get 10% Off Your First Order</h3>
        <p className="mt-2 text-yellow-200">
          Subscribe to our newsletter for exclusive deals, new arrivals, and music tips.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col sm:flex-row gap-2">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-white/10 border-white/20 text-white placeholder:text-yellow-300"
          />
          <Button 
            type="submit" 
            className="bg-yellow-600 hover:bg-yellow-700"
            disabled={loading}
          >
            {loading ? 'Subscribing...' : 'Subscribe'}
          </Button>
        </form>
        <p className="mt-3 text-xs text-yellow-300">
          We respect your privacy. Unsubscribe anytime.
        </p>
      </div>
    </div>
  );
}