'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/cart-context';
import { ApiError, verifyPaystack, type ApiVerifiedOrder } from '@/lib/backend-api';
import { formatPrice } from '@/lib/utils';

function ResultContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference') ?? searchParams.get('trxref');
  const { clearCart, setPromo } = useCart();
  const [state, setState] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [order, setOrder] = useState<ApiVerifiedOrder | null>(null);
  const [message, setMessage] = useState('');
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;

    if (!reference) {
      setState('failed');
      setMessage('No payment reference was provided.');
      return;
    }

    const run = async () => {
      try {
        const result = await verifyPaystack(reference);
        setOrder(result.order ?? { reference });
        clearCart();
        setPromo(null);
        setState('success');
      } catch (error) {
        setState('failed');
        if (error instanceof ApiError) {
          const status = (error.data as { status?: string } | null)?.status;
          setMessage(
            error.isUnavailable
              ? 'Payment temporarily unavailable — try again shortly.'
              : status === 'abandoned'
                ? 'This payment was not completed. No charge was made.'
                : error.message,
          );
        } else {
          setMessage('We could not reach the payment service. Please try again shortly.');
        }
      }
    };

    void run();
  }, [reference, clearCart, setPromo]);

  if (state === 'verifying') {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-muted-foreground" aria-hidden="true" />
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">Confirming your payment…</h1>
        <p className="mt-2 text-muted-foreground">Please wait while Paystack verifies your transaction.</p>
      </div>
    );
  }

  if (state === 'success' && order) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="mx-auto max-w-lg rounded-card border border-border bg-card p-8 shadow-card">
          <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          <h1 className="mt-6 text-2xl font-semibold tracking-tight">Thank you for your order</h1>
          <p className="mt-2 text-muted-foreground">
            Your payment was successful. We&apos;ve received your order and will get it moving shortly.
          </p>

          <div className="mt-6 space-y-3 border-t border-border pt-6 text-left text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order reference</span>
              <span className="font-medium tabular-nums">{order.reference}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount paid</span>
              <span className="font-medium tabular-nums">
                {formatPrice(order.amountNgn ?? 0, order.currency ?? 'NGN')}
              </span>
            </div>
            {order.channel && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment method</span>
                <span className="font-medium capitalize">{order.channel}</span>
              </div>
            )}
          </div>

          <Button asChild className="mt-8 w-full">
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <div className="mx-auto max-w-lg rounded-card border border-border bg-card p-8 shadow-card">
        <XCircle className="mx-auto h-16 w-16 text-destructive" aria-hidden="true" />
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">Payment not completed</h1>
        <p className="mt-2 text-muted-foreground">{message}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/checkout">Back to checkout</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/cart">Back to cart</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PayResultPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-20 text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-muted-foreground" aria-hidden="true" />
          <p className="mt-6 text-muted-foreground">Loading…</p>
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  );
}
