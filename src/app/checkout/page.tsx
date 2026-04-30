'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Check, ChevronRight, MapPin, CreditCard, Truck, ArrowLeft, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShippingSelector, DeliveryEstimate } from '@/components/shipping';
import { calculateShipping } from '@/lib/shipping';
import { useCart } from '@/lib/cart-context';
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
        <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground mb-6">Add some products to get started!</p>
        <Link href="/products">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🎸</span>
              <span className="font-bold text-lg text-yellow-600">ElectroMuscial</span>
            </Link>
            <Link href="/cart" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
              <ArrowLeft className="w-4 h-4" />
              Back to cart
            </Link>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-center">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = index < currentStepIndex;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center gap-2 ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isActive ? 'bg-blue-600 text-white' : isCompleted ? 'bg-green-600 text-white' : 'bg-gray-200'
                    }`}>
                      {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                    </div>
                    <span className="font-medium hidden sm:block">{step.name}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <ChevronRight className="w-5 h-5 text-gray-300 mx-4" />
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Guest Checkout Option */}
      <div className="container mx-auto px-4 py-4">
        <div className="bg-yellow-50 border border-purple-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-yellow-900">Already have an account?</p>
              <p className="text-sm text-yellow-700">
                Sign in for faster checkout and order tracking
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/sign-in?redirect=/checkout">Sign In</Link>
            </Button>
          </div>
          <p className="text-sm text-yellow-600 mt-3">
            Or continue as guest. You can create an account after placing your order.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              {/* Shipping Step */}
              {currentStep === 'shipping' && (
                <form onSubmit={shippingForm.handleSubmit(() => setCurrentStep('delivery'))} className="space-y-6">
                  <h2 className="text-xl font-semibold">Contact Information</h2>
                  
                  <div>
                    <Input
                      type="email"
                      placeholder="Email address"
                      {...shippingForm.register('email')}
                    />
                    {shippingForm.formState.errors.email && (
                      <p className="text-sm text-red-500 mt-1">{shippingForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <h2 className="text-xl font-semibold pt-4">Shipping Address</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Input
                        placeholder="First name"
                        {...shippingForm.register('firstName')}
                      />
                      {shippingForm.formState.errors.firstName && (
                        <p className="text-sm text-red-500 mt-1">{shippingForm.formState.errors.firstName.message}</p>
                      )}
                    </div>
                    <div>
                      <Input
                        placeholder="Last name"
                        {...shippingForm.register('lastName')}
                      />
                      {shippingForm.formState.errors.lastName && (
                        <p className="text-sm text-red-500 mt-1">{shippingForm.formState.errors.lastName.message}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <Input
                      placeholder="Address"
                      {...shippingForm.register('address1')}
                    />
                    {shippingForm.formState.errors.address1 && (
                      <p className="text-sm text-red-500 mt-1">{shippingForm.formState.errors.address1.message}</p>
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
                        <p className="text-sm text-red-500 mt-1">{shippingForm.formState.errors.city.message}</p>
                      )}
                    </div>
                    <div>
                      <select
                        className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm w-full"
                        {...shippingForm.register('state')}
                      >
                        <option value="">State</option>
                        {US_STATES.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                      {shippingForm.formState.errors.state && (
                        <p className="text-sm text-red-500 mt-1">{shippingForm.formState.errors.state.message}</p>
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
                        <p className="text-sm text-red-500 mt-1">{shippingForm.formState.errors.postalCode.message}</p>
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
                  <h2 className="text-xl font-semibold">Delivery Method</h2>
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
                  <h2 className="text-xl font-semibold">Payment Method</h2>
                  
                  <div className="p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center gap-3 mb-4">
                      <input type="radio" name="payment" defaultChecked className="w-4 h-4" />
                      <span className="font-medium">Credit or Debit Card</span>
                      <div className="ml-auto flex gap-1">
                        <span className="text-2xl">💳</span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Input
                          placeholder="Card number"
                          {...paymentForm.register('cardNumber')}
                          maxLength={16}
                        />
                        {paymentForm.formState.errors.cardNumber && (
                          <p className="text-sm text-red-500 mt-1">{paymentForm.formState.errors.cardNumber.message}</p>
                        )}
                      </div>
                      <div>
                        <Input
                          placeholder="Name on card"
                          {...paymentForm.register('cardName')}
                        />
                        {paymentForm.formState.errors.cardName && (
                          <p className="text-sm text-red-500 mt-1">{paymentForm.formState.errors.cardName.message}</p>
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
                            <p className="text-sm text-red-500 mt-1">{paymentForm.formState.errors.cardExpiry.message}</p>
                          )}
                        </div>
                        <div>
                          <Input
                            placeholder="CVC"
                            {...paymentForm.register('cardCvc')}
                            maxLength={4}
                          />
                          {paymentForm.formState.errors.cardCvc && (
                            <p className="text-sm text-red-500 mt-1">{paymentForm.formState.errors.cardCvc.message}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <input type="radio" name="payment" className="w-4 h-4" />
                      <span className="font-medium">PayPal</span>
                      <span className="text-2xl ml-2">🅿️</span>
                    </div>
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
                    <Link href="/cart">
                      <Button variant="outline">Back</Button>
                    </Link>
                  )}
                  
                  {currentStepIndex < steps.length - 1 ? (
                    <Button onClick={nextStep}>
                      Continue
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button className="bg-green-600 hover:bg-green-700">
                      Place Order
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
              <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
              
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-2xl relative">
                      {item.image}
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-gray-500 text-white text-xs rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.brand}</p>
                    </div>
                    <p className="text-sm font-medium">${item.price}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{selectedShipping ? `$${selectedShipping.price.toFixed(2)}` : '--'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (8%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-3">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {selectedShipping && shippingCalculation.estimatedDeliveryDates[selectedShipping.id] && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <span className="font-medium">Estimated Delivery:</span>{' '}
                    {shippingCalculation.estimatedDeliveryDates[selectedShipping.id].toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric'
                    })}
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
