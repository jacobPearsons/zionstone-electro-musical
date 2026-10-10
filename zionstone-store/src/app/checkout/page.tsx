'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Check, ChevronRight, MapPin, CreditCard, Truck, ArrowLeft, ShoppingBag, Lock, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShippingSelector, DeliveryEstimate } from '@/components/shipping';
import { ProductImage } from '@/components/product';
import { calculateShipping, formatDeliveryDate, qualifiesForFreeShipping, FREE_SHIPPING_THRESHOLD } from '@/lib/shipping';
import { ApiError, initializePaystack } from '@/lib/backend-api';
import { useCart } from '@/lib/cart-context';
import { promoDiscount } from '@/lib/promo-codes';
import { formatPrice } from '@/lib/utils';
import type { ShippingMethod } from '@/types/shipping';

const shippingSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  address1: z.string().min(5, 'Please enter a valid address'),
  address2: z.string().optional(),
  city: z.string().min(2, 'Please enter a valid city'),
  state: z.string().min(1, 'Please select a state'),
  postalCode: z.string().regex(/^\d{5}$/, 'Please enter a valid 5-digit ZIP code'),
  phone: z.string().regex(/^\d{10}$/, 'Please enter a valid 10-digit phone number').optional().or(z.literal('')),
});

type ShippingFormData = z.infer<typeof shippingSchema>;

const steps = [
  { id: 'shipping', name: 'Shipping', icon: MapPin },
  { id: 'delivery', name: 'Delivery', icon: Truck },
  { id: 'payment', name: 'Payment', icon: CreditCard },
];

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, totalItems, promo, promoCode } = useCart();
  const [currentStep, setCurrentStep] = useState('shipping');
  const [selectedShipping, setSelectedShipping] = useState<ShippingMethod | null>(null);
  const [shippingCalculation, setShippingCalculation] = useState(() => calculateShipping('90210'));
  const [email, setEmail] = useState('');
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const shippingForm = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      postalCode: '',
      phone: '',
    },
  });

  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [items, router]);

  useEffect(() => {
    if (currentStep !== 'payment') return;
    setEmail((previous) => previous || shippingForm.getValues('email'));
  }, [currentStep, shippingForm]);

  const subtotal = totalPrice;
  const discount = promoDiscount(promo, subtotal);
  const freeShipping = qualifiesForFreeShipping(subtotal);
  const shippingCost = selectedShipping ? (freeShipping ? 0 : selectedShipping.price) : 0;
  const total = subtotal - discount + shippingCost;

  const hasItems = items.length > 0;

  const handleShippingSelect = (method: ShippingMethod) => {
    setSelectedShipping(method);
  };

  const handleShippingChange = () => {
    const postalCode = shippingForm.getValues('postalCode');
    if (postalCode && postalCode.length === 5) {
      setShippingCalculation(calculateShipping(postalCode));
    }
  };

  const currentStepIndex =
    currentStep === 'review' ? steps.length : steps.findIndex(s => s.id === currentStep);

  const handlePlaceOrder = async () => {
    if (isPlacingOrder) return;

    const emailValue = email.trim() || shippingForm.getValues('email').trim();
    if (!emailValue || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      setPaymentError('Enter a valid email address to pay with Paystack.');
      toast.error('Enter a valid email address to continue.');
      return;
    }

    if (!selectedShipping) {
      setPaymentError('Choose a delivery method before paying.');
      return;
    }

    setPaymentError(null);
    setIsPlacingOrder(true);

    try {
      const result = await initializePaystack({
        items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        shippingMethodId: selectedShipping.id,
        email: emailValue,
        promoCode: promoCode || undefined,
      });

      window.location.href = result.authorizationUrl;
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.isUnavailable
            ? 'Payment temporarily unavailable — try again shortly.'
            : error.message
          : 'We could not reach the payment service. Please try again.';
      setPaymentError(message);
      toast.error(message);
      setIsPlacingOrder(false);
    }
  };

  if (!hasItems) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" aria-hidden="true" />
        <h1 className="text-2xl font-semibold tracking-tight mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground mb-2">Add some products to get started!</p>
        {/* `/checkout(.*)` is behind Clerk's `protect()` in src/middleware.ts, so
            an empty cart here can only be reached while signed in — but the copy
            has to say so rather than let a signed-out customer believe an empty
            cart is the only thing between them and an order. */}
        <p className="text-sm text-muted-foreground mb-6">
          Checking out requires a signed-in account.
        </p>
        <Button asChild>
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      {/* Checkout bar — the only chrome this page keeps. The layout header
          directly above already carries the wordmark and the cart link, so a
          second brand mark here put two logos and two "back to cart" targets
          within 100px of each other (spec §3.9). What checkout genuinely needs is
          a way back and a sense of where you are in the flow, and nothing else. */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 py-2">
            <Link
              href="/cart"
              className="flex min-h-11 shrink-0 items-center gap-2 text-sm text-muted-foreground transition-colors duration-200 ease-out hover:text-primary-strong"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              Back to cart
            </Link>
            <nav aria-label="Checkout progress" className="flex flex-1 items-center justify-start gap-4 overflow-x-auto sm:justify-center">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = step.id === currentStep;
                const isCompleted = index < currentStepIndex;

                return (
                  <div key={step.id} className="flex items-center">
                    <div className={`flex items-center gap-2 transition-colors duration-200 ease-out ${isActive ? 'text-primary-strong' : isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isActive ? 'bg-primary text-primary-foreground' : isCompleted ? 'bg-emerald-600 text-white' : 'bg-muted text-muted-foreground'
                      }`}>
                        {isCompleted ? <Check className="w-4 h-4" aria-hidden="true" /> : <Icon className="w-4 h-4" aria-hidden="true" />}
                      </div>
                      <span className="font-medium hidden sm:block">{step.name}</span>
                    </div>
                    {index < steps.length - 1 && (
                      <ChevronRight className="w-5 h-5 text-border mx-4" aria-hidden="true" />
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* The one honest sentence about auth. `/checkout(.*)` is protected by
          Clerk in src/middleware.ts, so a signed-out customer is redirected to
          sign-in before this component ever renders. The page used to promise
          the opposite — a guest path and an account created after the order —
          neither of which exists, and no order is ever placed here. */}
      <div className="container mx-auto px-4 pt-6">
        <p className="text-sm text-muted-foreground">
          Checkout is available to signed-in accounts. There is no guest checkout.
        </p>
      </div>

      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="rounded-card border border-border bg-card p-6">
              {/* Shipping Step */}
              {currentStep === 'shipping' && (
                <form onSubmit={shippingForm.handleSubmit(() => setCurrentStep('delivery'))} className="space-y-6">
                  <h2 className="text-xl font-semibold tracking-tight">Contact Information</h2>
                  
                  <div>
                    <label htmlFor="checkout-email" className="mb-1.5 block text-sm font-medium">Email address</label>
                    <Input
                      id="checkout-email"
                      type="email"
                      placeholder="Email address"
                      autoComplete="email"
                      aria-invalid={Boolean(shippingForm.formState.errors.email)}
                      aria-describedby={shippingForm.formState.errors.email ? 'checkout-email-error' : undefined}
                      {...shippingForm.register('email')}
                    />
                    {shippingForm.formState.errors.email && (
                      <p id="checkout-email-error" role="alert" className="text-sm text-destructive mt-1">{shippingForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <h2 className="text-xl font-semibold tracking-tight pt-4">Shipping Address</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="checkout-first-name" className="mb-1.5 block text-sm font-medium">First name</label>
                      <Input
                        id="checkout-first-name"
                        placeholder="First name"
                        autoComplete="given-name"
                        aria-invalid={Boolean(shippingForm.formState.errors.firstName)}
                        aria-describedby={shippingForm.formState.errors.firstName ? 'checkout-first-name-error' : undefined}
                        {...shippingForm.register('firstName')}
                      />
                      {shippingForm.formState.errors.firstName && (
                        <p id="checkout-first-name-error" role="alert" className="text-sm text-destructive mt-1">{shippingForm.formState.errors.firstName.message}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="checkout-last-name" className="mb-1.5 block text-sm font-medium">Last name</label>
                      <Input
                        id="checkout-last-name"
                        placeholder="Last name"
                        autoComplete="family-name"
                        aria-invalid={Boolean(shippingForm.formState.errors.lastName)}
                        aria-describedby={shippingForm.formState.errors.lastName ? 'checkout-last-name-error' : undefined}
                        {...shippingForm.register('lastName')}
                      />
                      {shippingForm.formState.errors.lastName && (
                        <p id="checkout-last-name-error" role="alert" className="text-sm text-destructive mt-1">{shippingForm.formState.errors.lastName.message}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="checkout-address1" className="mb-1.5 block text-sm font-medium">Street address</label>
                    <Input
                      id="checkout-address1"
                      placeholder="Address"
                      autoComplete="address-line1"
                      aria-invalid={Boolean(shippingForm.formState.errors.address1)}
                      aria-describedby={shippingForm.formState.errors.address1 ? 'checkout-address1-error' : undefined}
                      {...shippingForm.register('address1')}
                    />
                    {shippingForm.formState.errors.address1 && (
                      <p id="checkout-address1-error" role="alert" className="text-sm text-destructive mt-1">{shippingForm.formState.errors.address1.message}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="checkout-address2" className="mb-1.5 block text-sm font-medium">
                      Apartment, suite, etc. <span className="text-muted-foreground">(optional)</span>
                    </label>
                    <Input
                      id="checkout-address2"
                      placeholder="Apartment, suite, etc. (optional)"
                      autoComplete="address-line2"
                      {...shippingForm.register('address2')}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="checkout-city" className="mb-1.5 block text-sm font-medium">City</label>
                      <Input
                        id="checkout-city"
                        placeholder="City"
                        autoComplete="address-level2"
                        aria-invalid={Boolean(shippingForm.formState.errors.city)}
                        aria-describedby={shippingForm.formState.errors.city ? 'checkout-city-error' : undefined}
                        {...shippingForm.register('city')}
                      />
                      {shippingForm.formState.errors.city && (
                        <p id="checkout-city-error" role="alert" className="text-sm text-destructive mt-1">{shippingForm.formState.errors.city.message}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="checkout-state" className="mb-1.5 block text-sm font-medium">State</label>
                      <select
                        id="checkout-state"
                        autoComplete="address-level1"
                        aria-invalid={Boolean(shippingForm.formState.errors.state)}
                        aria-describedby={shippingForm.formState.errors.state ? 'checkout-state-error' : undefined}
                        className="min-h-11 rounded-md border border-input bg-background px-3 py-2 text-sm w-full"
                        {...shippingForm.register('state')}
                      >
                        <option value="">State</option>
                        {US_STATES.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                      {shippingForm.formState.errors.state && (
                        <p id="checkout-state-error" role="alert" className="text-sm text-destructive mt-1">{shippingForm.formState.errors.state.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="checkout-postal" className="mb-1.5 block text-sm font-medium">ZIP code</label>
                      <Input
                        id="checkout-postal"
                        placeholder="ZIP code"
                        autoComplete="postal-code"
                        aria-invalid={Boolean(shippingForm.formState.errors.postalCode)}
                        aria-describedby={shippingForm.formState.errors.postalCode ? 'checkout-postal-error' : undefined}
                        {...shippingForm.register('postalCode')}
                        maxLength={5}
                      />
                      {shippingForm.formState.errors.postalCode && (
                        <p id="checkout-postal-error" role="alert" className="text-sm text-destructive mt-1">{shippingForm.formState.errors.postalCode.message}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="checkout-phone" className="mb-1.5 block text-sm font-medium">
                        Phone <span className="text-muted-foreground">(optional)</span>
                      </label>
                      <Input
                        id="checkout-phone"
                        placeholder="Phone (optional)"
                        autoComplete="tel"
                        {...shippingForm.register('phone')}
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button type="submit">
                      Continue to Delivery
                      <ChevronRight className="w-4 h-4 ml-2" aria-hidden="true" />
                    </Button>
                  </div>
                </form>
              )}

              {/* Delivery Step */}
              {currentStep === 'delivery' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold tracking-tight">Delivery Method</h2>
                  <p className="text-sm text-muted-foreground">
                    Shipping to {shippingForm.getValues('city') || 'your location'}, {shippingForm.getValues('state') || ''} {shippingForm.getValues('postalCode')}
                  </p>

                  <ShippingSelector
                    methods={shippingCalculation.methods}
                    estimatedDeliveryDates={shippingCalculation.estimatedDeliveryDates}
                    selectedMethodId={selectedShipping?.id || ''}
                    onSelect={handleShippingSelect}
                  />

                  {selectedShipping && shippingCalculation.estimatedDeliveryDates[selectedShipping.id] && (
                    <DeliveryEstimate
                      estimatedDelivery={shippingCalculation.estimatedDeliveryDates[selectedShipping.id]}
                      shippingMethodName={selectedShipping.name}
                    />
                  )}

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={() => setCurrentStep('shipping')}>
                      Back
                    </Button>
                    <Button onClick={() => setCurrentStep('payment')} disabled={!selectedShipping}>
                      Continue to Payment
                      <ChevronRight className="w-4 h-4 ml-2" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Payment Step */}
              {currentStep === 'payment' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold tracking-tight">Payment Method</h2>

                  <div className="p-4 rounded-card border border-border bg-muted">
                    <div className="flex items-center gap-3">
                      <Lock className="h-5 w-5 text-primary-strong" aria-hidden="true" />
                      <span className="font-medium">Pay Securely with Paystack</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      You&apos;ll be redirected to Paystack to complete payment. We never see or store your card details.
                    </p>
                  </div>

                  <div>
                    <label htmlFor="paystack-email" className="block text-sm font-medium mb-2">
                      Email for your receipt
                    </label>
                    <Input
                      id="paystack-email"
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      autoComplete="email"
                    />
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button type="button" variant="outline" onClick={() => setCurrentStep('delivery')}>
                      Back
                    </Button>
                    <Button type="button" onClick={() => setCurrentStep('review')} disabled={!selectedShipping}>
                      Review Order
                      <ChevronRight className="w-4 h-4 ml-2" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Review Step */}
              {currentStep === 'review' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold tracking-tight">Review &amp; Pay</h2>

                  <div className="p-4 rounded-card border border-border bg-muted space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Items</span>
                      <span className="tabular-nums">{totalItems}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="tabular-nums">{formatPrice(subtotal)}</span>
                    </div>
                    {promo && discount > 0 && (
                      <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                        <span>Discount ({promo.code}, {promo.percent}%)</span>
                        <span className="tabular-nums">-{formatPrice(discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Shipping{selectedShipping ? ` — ${selectedShipping.name}` : ''}
                      </span>
                      <span className="tabular-nums">{shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}</span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
                      <span>Total</span>
                      <span className="tabular-nums">{formatPrice(total)}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                    <span>Payments are processed by Paystack. Your card details are never shared with us.</span>
                  </div>

                  {paymentError && (
                    <p role="alert" className="text-sm text-destructive">{paymentError}</p>
                  )}

                  <div className="flex justify-between pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep('payment')}
                      disabled={isPlacingOrder}
                    >
                      Back
                    </Button>
                    <Button type="button" onClick={handlePlaceOrder} disabled={isPlacingOrder}>
                      {isPlacingOrder ? 'Redirecting…' : `Pay ${formatPrice(total)}`}
                      {!isPlacingOrder && <Lock className="w-4 h-4 ml-2" aria-hidden="true" />}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="rounded-card border border-border bg-card p-6 sticky top-4">
              <h3 className="font-semibold tracking-tight text-lg mb-4">Order Summary</h3>
              
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 bg-muted rounded-card flex items-center justify-center text-2xl relative">
                      <ProductImage image={item.image} name={item.name} />
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-semibold tabular-nums rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.brand}</p>
                    </div>
                    <p className="text-sm font-semibold tabular-nums">{formatPrice(item.price, item.currency ?? 'NGN')}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t border-border pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="tabular-nums">{formatPrice(subtotal)}</span>
                </div>
                {promo && discount > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400">
                    <span>Discount ({promo.code}, {promo.percent}%)</span>
                    <span className="tabular-nums">-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="tabular-nums">
                    {selectedShipping ? (shippingCost === 0 ? 'Free' : formatPrice(shippingCost)) : '--'}
                  </span>
                </div>
                {freeShipping && (
                  <p className="text-sm text-emerald-600 dark:text-emerald-400">
                    Free shipping applied on orders over {formatPrice(FREE_SHIPPING_THRESHOLD)}
                  </p>
                )}
                <div className="flex justify-between text-lg font-semibold border-t border-border pt-3">
                  <span>Total</span>
                  <span className="tabular-nums">{formatPrice(total)}</span>
                </div>
              </div>

              {selectedShipping && shippingCalculation.estimatedDeliveryDates[selectedShipping.id] && (
                <div className="mt-4 p-3 rounded-card border border-border bg-primary/10">
                  <p className="text-sm text-foreground">
                    <span className="font-semibold">Estimated Delivery:</span>{' '}
                    {formatDeliveryDate(shippingCalculation.estimatedDeliveryDates[selectedShipping.id])}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
