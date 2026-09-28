'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Check, ChevronRight, MapPin, CreditCard, Truck, ArrowLeft, ShoppingBag, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShippingSelector, DeliveryEstimate } from '@/components/shipping';
import { calculateShipping, formatDeliveryDate } from '@/lib/shipping';
import { useCart } from '@/lib/cart-context';
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

const paymentSchema = z.object({
  cardNumber: z.string().regex(/^\d{16}$/, 'Please enter a valid 16-digit card number'),
  cardExpiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Please use format MM/YY'),
  cardCvc: z.string().regex(/^\d{3,4}$/, 'Please enter a valid CVC'),
  cardName: z.string().min(2, 'Please enter the name on your card'),
});

type ShippingFormData = z.infer<typeof shippingSchema>;
type PaymentFormData = z.infer<typeof paymentSchema>;

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
  const { items, totalPrice } = useCart();
  const [currentStep, setCurrentStep] = useState('shipping');
  const [selectedShipping, setSelectedShipping] = useState<ShippingMethod | null>(null);
  const [shippingCalculation, setShippingCalculation] = useState(() => calculateShipping('90210'));

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

  const paymentForm = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      cardNumber: '',
      cardExpiry: '',
      cardCvc: '',
      cardName: '',
    },
  });

  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [items, router]);

  const subtotal = totalPrice;
  const shippingCost = selectedShipping?.price || 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shippingCost + tax;

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

  const nextStep = () => {
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id);
    }
  };

  const prevStep = () => {
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id);
    }
  };

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  if (!hasItems) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
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
                    <Input
                      type="email"
                      placeholder="Email address"
                      {...shippingForm.register('email')}
                    />
                    {shippingForm.formState.errors.email && (
                      <p className="text-sm text-destructive mt-1">{shippingForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <h2 className="text-xl font-semibold tracking-tight pt-4">Shipping Address</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Input
                        placeholder="First name"
                        {...shippingForm.register('firstName')}
                      />
                      {shippingForm.formState.errors.firstName && (
                        <p className="text-sm text-destructive mt-1">{shippingForm.formState.errors.firstName.message}</p>
                      )}
                    </div>
                    <div>
                      <Input
                        placeholder="Last name"
                        {...shippingForm.register('lastName')}
                      />
                      {shippingForm.formState.errors.lastName && (
                        <p className="text-sm text-destructive mt-1">{shippingForm.formState.errors.lastName.message}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <Input
                      placeholder="Address"
                      {...shippingForm.register('address1')}
                    />
                    {shippingForm.formState.errors.address1 && (
                      <p className="text-sm text-destructive mt-1">{shippingForm.formState.errors.address1.message}</p>
                    )}
                  </div>
                  <Input
                    placeholder="Apartment, suite, etc. (optional)"
                    {...shippingForm.register('address2')}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Input
                        placeholder="City"
                        {...shippingForm.register('city')}
                      />
                      {shippingForm.formState.errors.city && (
                        <p className="text-sm text-destructive mt-1">{shippingForm.formState.errors.city.message}</p>
                      )}
                    </div>
                    <div>
                      <select
                        className="min-h-11 rounded-md border border-input bg-background px-3 py-2 text-sm w-full"
                        {...shippingForm.register('state')}
                      >
                        <option value="">State</option>
                        {US_STATES.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                      {shippingForm.formState.errors.state && (
                        <p className="text-sm text-destructive mt-1">{shippingForm.formState.errors.state.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Input
                        placeholder="ZIP code"
                        {...shippingForm.register('postalCode')}
                        maxLength={5}
                      />
                      {shippingForm.formState.errors.postalCode && (
                        <p className="text-sm text-destructive mt-1">{shippingForm.formState.errors.postalCode.message}</p>
                      )}
                    </div>
                    <Input
                      placeholder="Phone (optional)"
                      {...shippingForm.register('phone')}
                    />
                  </div>

                  <div className="pt-4">
                    <Button type="submit">
                      Continue to Delivery
                      <ChevronRight className="w-4 h-4 ml-2" />
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
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Payment Step */}
              {currentStep === 'payment' && (
                <form onSubmit={paymentForm.handleSubmit(() => setCurrentStep('review'))} className="space-y-6">
                  <h2 className="text-xl font-semibold tracking-tight">Payment Method</h2>
                  
                  <div className="p-4 rounded-card border border-border bg-muted">
                    <label className="flex min-h-11 items-center gap-3 mb-4">
                      <input type="radio" name="payment" defaultChecked className="w-4 h-4 flex-shrink-0 accent-primary" />
                      <span className="font-medium">Credit or Debit Card</span>
                      <CreditCard className="ml-auto h-5 w-5 text-primary-strong" aria-hidden="true" />
                    </label>
                    
                    <div className="space-y-4">
                      <div>
                        <Input
                          placeholder="Card number"
                          {...paymentForm.register('cardNumber')}
                          maxLength={16}
                        />
                        {paymentForm.formState.errors.cardNumber && (
                          <p className="text-sm text-destructive mt-1">{paymentForm.formState.errors.cardNumber.message}</p>
                        )}
                      </div>
                      <div>
                        <Input
                          placeholder="Name on card"
                          {...paymentForm.register('cardName')}
                        />
                        {paymentForm.formState.errors.cardName && (
                          <p className="text-sm text-destructive mt-1">{paymentForm.formState.errors.cardName.message}</p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Input
                            placeholder="MM / YY"
                            {...paymentForm.register('cardExpiry')}
                            maxLength={5}
                          />
                          {paymentForm.formState.errors.cardExpiry && (
                            <p className="text-sm text-destructive mt-1">{paymentForm.formState.errors.cardExpiry.message}</p>
                          )}
                        </div>
                        <div>
                          <Input
                            placeholder="CVC"
                            {...paymentForm.register('cardCvc')}
                            maxLength={4}
                          />
                          {paymentForm.formState.errors.cardCvc && (
                            <p className="text-sm text-destructive mt-1">{paymentForm.formState.errors.cardCvc.message}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-card border border-border">
                    <label className="flex min-h-11 items-center gap-3">
                      <input type="radio" name="payment" className="w-4 h-4 flex-shrink-0 accent-primary" />
                      <span className="font-medium">PayPal</span>
                      <Wallet className="ml-2 h-5 w-5 text-muted-foreground" aria-hidden="true" />
                    </label>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button type="button" variant="outline" onClick={() => setCurrentStep('delivery')}>
                      Back
                    </Button>
                    <Button type="submit">
                      Review Order
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </form>
              )}

              {/* Navigation Buttons - Only show for delivery step */}
              {currentStep !== 'shipping' && currentStep !== 'payment' && (
                <div className="flex justify-between pt-6 mt-6 border-t">
                  {currentStepIndex > 0 ? (
                    <Button variant="outline" onClick={prevStep}>
                      Back
                    </Button>
                  ) : (
                    <Button asChild variant="outline">
                      <Link href="/cart">Back</Link>
                    </Button>
                  )}
                  
                  {currentStepIndex < steps.length - 1 ? (
                    <Button onClick={nextStep}>
                      Continue
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button>
                      Place Order
                    </Button>
                  )}
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
                      {item.image}
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-semibold tabular-nums rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.brand}</p>
                    </div>
                    <p className="text-sm font-semibold tabular-nums">{formatPrice(item.price)}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t border-border pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="tabular-nums">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="tabular-nums">{selectedShipping ? formatPrice(selectedShipping.price) : '--'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (8%)</span>
                  <span className="tabular-nums">{formatPrice(tax)}</span>
                </div>
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
