# E-Commerce Website Upgrade Implementation Plan

## Overview
This document provides a step-by-step implementation guide to upgrade the current Next.js + Tailwind CSS e-commerce website to meet production standards. Based on the state analysis, we prioritize critical gaps while maintaining existing well-implemented features.

**Current Stack:** Next.js 14+ (App Router), Tailwind CSS, shadcn/ui, Clerk Auth, Zustand/Context
**Target:** Production-ready e-commerce with full spec compliance

---

## Phase 1: Critical Fixes (Immediate)

### 1.1 Fix Branding Inconsistency

**Problem:** Checkout header shows "CircuitCart" instead of "ElectroMuscial"

**Fix in `src/app/checkout/page.tsx`:**

```tsx
// Replace all instances of "CircuitCart" with "ElectroMuscial"
// In the checkout header component:

<Link href="/" className="flex items-center gap-2">
  <span className="text-xl font-bold text-primary">ElectroMuscial</span>
</Link>
```

**Global Search & Replace:**
- Search: `CircuitCart`
- Replace: `ElectroMuscial`
- Files to check: `checkout/page.tsx`, `layout.tsx`, `footer.tsx`, any email templates

---

### 1.2 Connect Checkout to Real Cart Data

**Problem:** Checkout uses hardcoded items instead of cart context/state

**Implementation:**

```tsx
// src/app/checkout/page.tsx
"use client";

import { useCart } from "@/hooks/use-cart"; // or your cart context
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CheckoutPage() {
  const { items, total, isLoading } = useCart();
  const router = useRouter();

  // Redirect if cart is empty
  useEffect(() => {
    if (!isLoading && items.length === 0) {
      router.push("/cart");
    }
  }, [items, isLoading, router]);

  if (isLoading) return <CheckoutSkeleton />;
  if (items.length === 0) return null; // Will redirect

  return (
    <div className="container mx-auto px-4 py-8">
      <CheckoutHeader />
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <CheckoutSteps items={items} />
        </div>
        <div className="lg:col-span-1">
          <OrderSummary items={items} total={total} />
        </div>
      </div>
    </div>
  );
}
```

**Cart Hook Pattern:**

```tsx
// src/hooks/use-cart.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variant?: { color?: string; size?: string };
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const current = get().items;
        const existing = current.find((i) => i.id === item.id);
        if (existing) {
          set({
            items: current.map((i) =>
              i.id === item.id
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          });
        } else {
          set({ items: [...current, item] });
        }
      },
      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },
      updateQuantity: (id, quantity) => {
        if (quantity < 1) {
          get().removeItem(id);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, quantity } : i
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      get total() {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
      },
      get itemCount() {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    { name: "cart-storage" }
  )
);
```

---

## Phase 2: Product Detail Page (PDP) Enhancements

### 2.1 Product Image Gallery with Zoom & Lightbox

**New Component: `src/components/product/ProductGallery.tsx`**

```tsx
"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ZoomIn, X } from "lucide-react";

interface ProductGalleryProps {
  images: { src: string; alt: string }[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  const selectedImage = images[selectedIndex];

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setZoomPosition({ x, y });
    },
    []
  );

  return (
    <div className="space-y-4">
      {/* Main Image with Zoom */}
      <div className="relative aspect-square bg-muted rounded-lg overflow-hidden group">
        <Dialog>
          <DialogTrigger asChild>
            <div
              className="relative w-full h-full cursor-zoom-in"
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
            >
              <Image
                src={selectedImage.src}
                alt={selectedImage.alt}
                fill
                className="object-cover transition-transform duration-300"
                style={
                  isZoomed
                    ? {
                        transform: `scale(2)`,
                        transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                      }
                    : {}
                }
                priority
              />
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-background/80 backdrop-blur-sm p-2 rounded-full">
                  <ZoomIn className="w-5 h-5" />
                </div>
              </div>
            </div>
          </DialogTrigger>

          {/* Fullscreen Lightbox */}
          <DialogContent className="max-w-5xl w-full p-0 bg-background/95 backdrop-blur-xl">
            <div className="relative aspect-square">
              <Image
                src={selectedImage.src}
                alt={selectedImage.alt}
                fill
                className="object-contain"
              />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      idx === selectedIndex ? "bg-white" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Thumbnail Strip */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {images.map((image, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedIndex(idx)}
            className={`relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0 border-2 transition-colors ${
              idx === selectedIndex
                ? "border-primary"
                : "border-transparent hover:border-muted-foreground"
            }`}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
```

---

### 2.2 Star Rating with Review Link

**Enhanced `StarRating` Component:**

```tsx
// src/components/product/StarRating.tsx
import { Star } from "lucide-react";
import Link from "next/link";

interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  href?: string; // Link to reviews section
}

export function StarRating({
  rating,
  reviewCount,
  size = "md",
  showValue = true,
  href,
}: StarRatingProps) {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  const content = (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`${sizeClasses[size]} ${
              i < fullStars
                ? "fill-yellow-400 text-yellow-400"
                : i === fullStars && hasHalfStar
                ? "fill-yellow-400/50 text-yellow-400"
                : "fill-muted text-muted"
            }`}
          />
        ))}
      </div>
      {showValue && (
        <span className="text-sm font-medium">{rating.toFixed(1)}</span>
      )}
      {reviewCount !== undefined && (
        <span className="text-sm text-muted-foreground">
          ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex hover:underline underline-offset-4"
      >
        {content}
      </Link>
    );
  }

  return content;
}
```

---

### 2.3 Delivery Estimator (Zip Code Input)

**New Component: `src/components/product/DeliveryEstimator.tsx`**

```tsx
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Truck, Check, X } from "lucide-react";

interface DeliveryEstimatorProps {
  productId: string;
}

export function DeliveryEstimator({ productId }: DeliveryEstimatorProps) {
  const [zipCode, setZipCode] = useState("");
  const [estimate, setEstimate] = useState<{
    date: string;
    cost: number;
    available: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEstimate = async () => {
    if (zipCode.length < 5) return;
    setLoading(true);

    // Simulate API call - replace with real shipping API
    await new Promise((resolve) => setTimeout(resolve, 800));

    setEstimate({
      date: new Date(Date.now() + 3 * 86400000).toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      }),
      cost: 0, // Free shipping
      available: true,
    });
    setLoading(false);
  };

  return (
    <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Truck className="w-4 h-4" />
        <span>Delivery Estimate</span>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Enter ZIP code"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value.replace(/\D/g, "").slice(0, 5))}
          maxLength={5}
          className="flex-1"
        />
        <Button
          onClick={handleEstimate}
          disabled={zipCode.length < 5 || loading}
          variant="secondary"
        >
          {loading ? "Checking..." : "Check"}
        </Button>
      </div>

      {estimate && (
        <div
          className={`flex items-start gap-2 text-sm ${
            estimate.available ? "text-green-600" : "text-red-600"
          }`}
        >
          {estimate.available ? (
            <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
          ) : (
            <X className="w-4 h-4 mt-0.5 flex-shrink-0" />
          )}
          <div>
            {estimate.available ? (
              <>
                <p className="font-medium">
                  FREE delivery by {estimate.date}
                </p>
                <p className="text-muted-foreground">
                  Order within 4 hours 23 minutes
                </p>
              </>
            ) : (
              <p>Delivery not available to this location</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

---

### 2.4 Product Information Tabs (Reviews, Q&A, Shipping)

**New Component: `src/components/product/ProductTabs.tsx`**

```tsx
"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StarRating } from "./StarRating";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThumbsUp, MessageCircle, Truck, RotateCcw, Shield } from "lucide-react";

interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  content: string;
  helpful: number;
  verified: boolean;
  images?: string[];
}

interface ProductTabsProps {
  description: string;
  specifications: Record<string, string>;
  features: string[];
  reviews: Review[];
  reviewStats: {
    average: number;
    total: number;
    breakdown: Record<1 | 2 | 3 | 4 | 5, number>;
  };
}

export function ProductTabs({
  description,
  specifications,
  features,
  reviews,
  reviewStats,
}: ProductTabsProps) {
  return (
    <Tabs defaultValue="description" className="w-full">
      <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-auto">
        {["Description", "Specifications", "Reviews", "Q&A", "Shipping & Returns"].map(
          (tab) => (
            <TabsTrigger
              key={tab}
              value={tab.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-")}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-4"
            >
              {tab}
              {tab === "Reviews" && reviewStats.total > 0 && (
                <span className="ml-2 text-xs text-muted-foreground">
                  ({reviewStats.total})
                </span>
              )}
            </TabsTrigger>
          )
        )}
      </TabsList>

      <TabsContent value="description" className="pt-6">
        <div className="prose max-w-none">
          <p className="text-muted-foreground leading-relaxed">{description}</p>
          {features.length > 0 && (
            <ul className="mt-4 space-y-2">
              {features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </TabsContent>

      <TabsContent value="specifications" className="pt-6">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(specifications).map(([key, value]) => (
            <div key={key} className="flex flex-col p-3 bg-muted/50 rounded-lg">
              <dt className="text-sm text-muted-foreground">{key}</dt>
              <dd className="font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      </TabsContent>

      <TabsContent value="reviews" className="pt-6">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Rating Summary */}
          <div className="space-y-4">
            <div className="text-center p-6 bg-muted/50 rounded-lg">
              <div className="text-5xl font-bold">{reviewStats.average.toFixed(1)}</div>
              <StarRating rating={reviewStats.average} size="sm" showValue={false} />
              <p className="text-sm text-muted-foreground mt-2">
                Based on {reviewStats.total} reviews
              </p>
            </div>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = reviewStats.breakdown[star as 1 | 2 | 3 | 4 | 5] || 0;
                const percentage = reviewStats.total > 0 ? (count / reviewStats.total) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2 text-sm">
                    <span className="w-3">{star}</span>
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <Progress value={percentage} className="h-2 flex-1" />
                    <span className="w-8 text-right text-muted-foreground">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Review List */}
          <div className="md:col-span-2 space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-b pb-6 last:border-0">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{review.author[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{review.author}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <StarRating rating={review.rating} size="sm" showValue={false} />
                        <span>•</span>
                        <span>{review.date}</span>
                        {review.verified && (
                          <span className="text-green-600">Verified Purchase</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <h4 className="font-medium mt-3">{review.title}</h4>
                <p className="text-muted-foreground mt-1">{review.content}</p>
                {review.images && (
                  <div className="flex gap-2 mt-3">
                    {review.images.map((img, idx) => (
                      <div key={idx} className="relative w-20 h-20 rounded-md overflow-hidden">
                        <Image src={img} alt="" fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                )}
                <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mt-3">
                  <ThumbsUp className="w-4 h-4" />
                  Helpful ({review.helpful})
                </button>
              </div>
            ))}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="q-a" className="pt-6">
        <div className="text-center py-12">
          <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium">No questions yet</h3>
          <p className="text-muted-foreground mt-1">
            Be the first to ask a question about this product
          </p>
          <Button className="mt-4">Ask a Question</Button>
        </div>
      </TabsContent>

      <TabsContent value="shipping-returns" className="pt-6">
        <div className="grid sm:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-muted/50 rounded-lg">
            <Truck className="w-8 h-8 mx-auto mb-3 text-primary" />
            <h4 className="font-medium">Free Shipping</h4>
            <p className="text-sm text-muted-foreground mt-1">
              On orders over $50. 2-5 business days
            </p>
          </div>
          <div className="text-center p-6 bg-muted/50 rounded-lg">
            <RotateCcw className="w-8 h-8 mx-auto mb-3 text-primary" />
            <h4 className="font-medium">Easy Returns</h4>
            <p className="text-sm text-muted-foreground mt-1">
              30-day return window. Free return shipping
            </p>
          </div>
          <div className="text-center p-6 bg-muted/50 rounded-lg">
            <Shield className="w-8 h-8 mx-auto mb-3 text-primary" />
            <h4 className="font-medium">Warranty</h4>
            <p className="text-sm text-muted-foreground mt-1">
              2-year manufacturer warranty included
            </p>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
```

---

## Phase 3: Checkout Overhaul

### 3.1 Multi-Step Checkout with Validation

**New Component: `src/components/checkout/CheckoutSteps.tsx`**

```tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Truck, Package, ChevronRight, ChevronLeft, User, Check } from "lucide-react";

const shippingSchema = z.object({
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code"),
  phone: z.string().regex(/^\d{10}$/, "10-digit phone number required"),
  saveAddress: z.boolean().default(false),
});

const paymentSchema = z.object({
  cardNumber: z.string().regex(/^\d{16}$/, "16-digit card number required"),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Format: MM/YY"),
  cvv: z.string().regex(/^\d{3,4}$/, "3-4 digit CVV required"),
  nameOnCard: z.string().min(2, "Name on card is required"),
  billingSameAsShipping: z.boolean().default(true),
});

type ShippingData = z.infer<typeof shippingSchema>;
type PaymentData = z.infer<typeof paymentSchema>;

const steps = [
  { id: "information", label: "Information", icon: User },
  { id: "shipping", label: "Shipping", icon: Truck },
  { id: "payment", label: "Payment", icon: CreditCard },
  { id: "review", label: "Review", icon: Package },
];

export function CheckoutSteps() {
  const [currentStep, setCurrentStep] = useState(0);
  const [checkoutData, setCheckoutData] = useState<{
    shipping?: ShippingData;
    payment?: PaymentData;
  }>({});

  const shippingForm = useForm<ShippingData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: checkoutData.shipping || {
      email: "",
      firstName: "",
      lastName: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      phone: "",
      saveAddress: false,
    },
  });

  const paymentForm = useForm<PaymentData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: checkoutData.payment || {
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      nameOnCard: "",
      billingSameAsShipping: true,
    },
  });

  const handleShippingSubmit = (data: ShippingData) => {
    setCheckoutData((prev) => ({ ...prev, shipping: data }));
    setCurrentStep(2); // Skip to payment (shipping method selection could be step 1.5)
  };

  const handlePaymentSubmit = (data: PaymentData) => {
    setCheckoutData((prev) => ({ ...prev, payment: data }));
    setCurrentStep(3);
  };

  const handlePlaceOrder = () => {
    // Submit order to API
    console.log("Order placed:", checkoutData);
    // Redirect to confirmation page
  };

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-between">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = idx === currentStep;
          const isCompleted = idx < currentStep;

          return (
            <div key={step.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    isCompleted
                      ? "bg-green-500 text-white"
                      : isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span
                  className={`text-xs mt-2 font-medium ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-2 ${
                    isCompleted ? "bg-green-500" : "bg-muted"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep].label}</CardTitle>
        </CardHeader>
        <CardContent>
          {currentStep === 0 && (
            <Form {...shippingForm}>
              <form onSubmit={shippingForm.handleSubmit(handleShippingSubmit)} className="space-y-4">
                <FormField
                  control={shippingForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    control={shippingForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={shippingForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={shippingForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main St" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid sm:grid-cols-3 gap-4">
                  <FormField
                    control={shippingForm.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="New York" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={shippingForm.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input placeholder="NY" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={shippingForm.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ZIP Code</FormLabel>
                        <FormControl>
                          <Input placeholder="10001" maxLength={10} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={shippingForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="5551234567" maxLength={10} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={shippingForm.control}
                  name="saveAddress"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Save this address for next time</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end pt-4">
                  <Button type="submit" size="lg">
                    Continue to Shipping
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </form>
            </Form>
          )}

          {currentStep === 2 && (
            <Form {...paymentForm}>
              <form onSubmit={paymentForm.handleSubmit(handlePaymentSubmit)} className="space-y-4">
                {/* Payment Method Selection */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {["Credit Card", "PayPal", "Apple Pay"].map((method) => (
                    <button
                      key={method}
                      type="button"
                      className="p-4 border rounded-lg text-center hover:border-primary transition-colors"
                    >
                      <CreditCard className="w-6 h-6 mx-auto mb-2" />
                      <span className="text-sm">{method}</span>
                    </button>
                  ))}
                </div>

                <FormField
                  control={paymentForm.control}
                  name="cardNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Card Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="1234 5678 9012 3456"
                          maxLength={16}
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.value.replace(/\D/g, ""))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={paymentForm.control}
                    name="expiryDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiry Date</FormLabel>
                        <FormControl>
                          <Input placeholder="MM/YY" maxLength={5} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={paymentForm.control}
                    name="cvv"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CVV</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="123" maxLength={4} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={paymentForm.control}
                  name="nameOnCard"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name on Card</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(0)}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button type="submit" size="lg">
                    Review Order
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </form>
            </Form>
          )}

          {currentStep === 3 && checkoutData.shipping && (
            <div className="space-y-6">
              <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">Contact</p>
                    <p className="text-sm text-muted-foreground">{checkoutData.shipping.email}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setCurrentStep(0)}>
                    Change
                  </Button>
                </div>
                <Separator />
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">Ship to</p>
                    <p className="text-sm text-muted-foreground">
                      {checkoutData.shipping.address}, {checkoutData.shipping.city},{" "}
                      {checkoutData.shipping.state} {checkoutData.shipping.zipCode}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setCurrentStep(0)}>
                    Change
                  </Button>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(2)}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button size="lg" onClick={handlePlaceOrder}>
                  Place Order
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

---

### 3.2 Guest Checkout Option

**Add to checkout page header:**

```tsx
// In the checkout page, before the form:

<div className="mb-6 p-4 bg-muted/50 rounded-lg">
  <div className="flex items-center justify-between">
    <div>
      <p className="font-medium">Already have an account?</p>
      <p className="text-sm text-muted-foreground">
        Sign in for faster checkout and order tracking
      </p>
    </div>
    <Button variant="outline" asChild>
      <Link href="/sign-in?redirect=/checkout">Sign In</Link>
    </Button>
  </div>
  <Separator className="my-4" />
  <p className="text-sm text-muted-foreground">
    Or continue as guest. You can create an account after placing your order.
  </p>
</div>
```

---

### 3.3 Promo Code Input in Cart

**Add to `src/app/cart/page.tsx`:**

```tsx
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tag, Check, X } from "lucide-react";

export function PromoCodeInput() {
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState<{ code: string; discount: number } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError("");

    // Simulate API validation
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Mock validation - replace with real API
    if (code.toUpperCase() === "SAVE20") {
      setApplied({ code: code.toUpperCase(), discount: 20 });
    } else {
      setError("Invalid promo code");
    }
    setLoading(false);
  };

  const handleRemove = () => {
    setApplied(null);
    setCode("");
    setError("");
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Tag className="w-4 h-4" />
        <span>Promo Code</span>
      </div>

      {applied ? (
        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600" />
            <span className="font-medium text-green-700 dark:text-green-400">
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
            onChange={(e) => setCode(e.target.value)}
            className="flex-1"
            onKeyDown={(e) => e.key === "Enter" && handleApply()}
          />
          <Button
            variant="secondary"
            onClick={handleApply}
            disabled={loading || !code.trim()}
          >
            {loading ? "Applying..." : "Apply"}
          </Button>
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
```

**Integrate into cart summary:**

```tsx
// In cart page order summary section:
<div className="space-y-4">
  <PromoCodeInput />

  <div className="space-y-2 text-sm">
    <div className="flex justify-between">
      <span className="text-muted-foreground">Subtotal</span>
      <span>${subtotal.toFixed(2)}</span>
    </div>
    {appliedDiscount > 0 && (
      <div className="flex justify-between text-green-600">
        <span>Discount</span>
        <span>-${appliedDiscount.toFixed(2)}</span>
      </div>
    )}
    <div className="flex justify-between">
      <span className="text-muted-foreground">Shipping</span>
      <span>{shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}</span>
    </div>
    <div className="flex justify-between">
      <span className="text-muted-foreground">Tax</span>
      <span>${tax.toFixed(2)}</span>
    </div>
    <Separator />
    <div className="flex justify-between text-lg font-semibold">
      <span>Total</span>
      <span>${(subtotal - appliedDiscount + shipping + tax).toFixed(2)}</span>
    </div>
  </div>
</div>
```

---

## Phase 4: Dashboard Enhancements

### 4.1 Order Tracking Details

**Enhanced Order Card:**

```tsx
// src/components/dashboard/OrderCard.tsx
import { Package, Truck, CheckCircle, Clock, MapPin } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

interface Order {
  id: string;
  date: string;
  total: number;
  status: "processing" | "shipped" | "out_for_delivery" | "delivered" | "cancelled";
  items: { name: string; image: string; quantity: number }[];
  trackingNumber?: string;
  estimatedDelivery?: string;
  trackingSteps: {
    label: string;
    date: string;
    completed: boolean;
    current: boolean;
  }[];
}

const statusConfig = {
  processing: { icon: Clock, color: "text-yellow-500", bg: "bg-yellow-50" },
  shipped: { icon: Truck, color: "text-blue-500", bg: "bg-blue-50" },
  out_for_delivery: { icon: MapPin, color: "text-orange-500", bg: "bg-orange-50" },
  delivered: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-50" },
  cancelled: { icon: X, color: "text-red-500", bg: "bg-red-50" },
};

export function OrderCard({ order }: { order: Order }) {
  const config = statusConfig[order.status];
  const StatusIcon = config.icon;
  const completedSteps = order.trackingSteps.filter((s) => s.completed).length;
  const progress = (completedSteps / order.trackingSteps.length) * 100;

  return (
    <div className="border rounded-lg p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">Order #{order.id}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
              <StatusIcon className="w-3 h-3 inline mr-1" />
              {order.status.replace("_", " ")}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Placed on {order.date}
          </p>
        </div>
        <p className="font-semibold">${order.total.toFixed(2)}</p>
      </div>

      {/* Tracking Progress */}
      {order.status !== "cancelled" && (
        <div className="space-y-3">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            {order.trackingSteps.map((step, idx) => (
              <div key={idx} className={`text-center flex-1 ${step.current ? "text-primary font-medium" : ""}`}>
                <p>{step.label}</p>
                {step.date && <p className="text-[10px]">{step.date}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex-shrink-0 w-16 h-16 relative rounded-md overflow-hidden bg-muted">
            <Image src={item.image} alt={item.name} fill className="object-cover" />
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/dashboard/orders/${order.id}`}>View Details</Link>
        </Button>
        {order.trackingNumber && (
          <Button variant="ghost" size="sm">
            <Truck className="w-4 h-4 mr-2" />
            Track Package
          </Button>
        )}
      </div>
    </div>
  );
}
```

---

### 4.2 Wishlist to Cart Integration

**Enhanced Wishlist Item:**

```tsx
// src/components/dashboard/WishlistItem.tsx
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Trash2, Bell } from "lucide-react";
import { toast } from "sonner";

interface WishlistItemProps {
  item: {
    id: string;
    name: string;
    price: number;
    image: string;
    inStock: boolean;
    stockQuantity?: number;
  };
  onRemove: (id: string) => void;
}

export function WishlistItem({ item, onRemove }: WishlistItemProps) {
  const { addItem } = useCart();

  const handleMoveToCart = () => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image,
    });
    toast.success(`${item.name} added to cart`);
    onRemove(item.id); // Optional: remove from wishlist after adding
  };

  return (
    <div className="flex gap-4 p-4 border rounded-lg group">
      <div className="relative w-24 h-24 rounded-md overflow-hidden bg-muted flex-shrink-0">
        <Image src={item.image} alt={item.name} fill className="object-cover" />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-medium truncate">{item.name}</h4>
        <p className="text-lg font-semibold mt-1">${item.price.toFixed(2)}</p>

        <div className="flex items-center gap-2 mt-2">
          {item.inStock ? (
            <span className="text-sm text-green-600">In Stock</span>
          ) : (
            <span className="text-sm text-red-500">Out of Stock</span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Button
          size="sm"
          disabled={!item.inStock}
          onClick={handleMoveToCart}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Move to Cart
        </Button>

        {!item.inStock && (
          <Button variant="outline" size="sm">
            <Bell className="w-4 h-4 mr-2" />
            Notify Me
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-red-500"
          onClick={() => onRemove(item.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
```

---

## Phase 5: UI Polish & Missing Components

### 5.1 Toast Notifications (Sonner)

**Already using Sonner - enhance with custom styling:**

```tsx
// src/app/layout.tsx - ensure Sonner is configured
import { Toaster } from "@/components/ui/sonner";

// In your layout:
<Toaster 
  position="bottom-right"
  toastOptions={{
    classNames: {
      toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
      description: "group-[.toast]:text-muted-foreground",
      actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
      cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
    },
  }}
/>
```

**Usage examples:**

```tsx
import { toast } from "sonner";

// Success
toast.success("Item added to cart", {
  description: "Fender Stratocaster - $1,299",
  action: {
    label: "View Cart",
    onClick: () => router.push("/cart"),
  },
});

// Error
toast.error("Unable to add item", {
  description: "Please try again later",
});

// Promise
toast.promise(checkoutAPI.placeOrder(data), {
  loading: "Processing your order...",
  success: "Order placed successfully!",
  error: "Failed to place order",
});
```

---

### 5.2 Skeleton Loaders

**Enhanced Product Skeleton:**

```tsx
// src/components/ui/skeleton.tsx extensions
import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-square rounded-lg" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function CheckoutSkeleton() {
  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        <Skeleton className="h-12" />
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-48" />
        <Skeleton className="h-32" />
      </div>
    </div>
  );
}
```

---

### 5.3 Empty States

```tsx
// src/components/ui/empty-state.tsx
import { Package, Search, ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface EmptyStateProps {
  type: "cart" | "wishlist" | "orders" | "search" | "products";
  title?: string;
  description?: string;
  action?: { label: string; href: string };
}

const config = {
  cart: {
    icon: ShoppingCart,
    defaultTitle: "Your cart is empty",
    defaultDescription: "Looks like you haven't added anything to your cart yet.",
    defaultAction: { label: "Start Shopping", href: "/products" },
  },
  wishlist: {
    icon: Heart,
    defaultTitle: "Your wishlist is empty",
    defaultDescription: "Save items you love and check their availability.",
    defaultAction: { label: "Browse Products", href: "/products" },
  },
  orders: {
    icon: Package,
    defaultTitle: "No orders yet",
    defaultDescription: "You haven't placed any orders yet.",
    defaultAction: { label: "Start Shopping", href: "/products" },
  },
  search: {
    icon: Search,
    defaultTitle: "No results found",
    defaultDescription: "Try adjusting your search or filters.",
  },
  products: {
    icon: Package,
    defaultTitle: "No products available",
    defaultDescription: "Check back later for new arrivals.",
  },
};

export function EmptyState({
  type,
  title,
  description,
  action,
}: EmptyStateProps) {
  const cfg = config[type];
  const Icon = cfg.icon;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold">{title || cfg.defaultTitle}</h3>
      <p className="text-muted-foreground mt-2 max-w-sm">
        {description || cfg.defaultDescription}
      </p>
      {(action || cfg.defaultAction) && (
        <Button className="mt-6" asChild>
          <Link href={(action || cfg.defaultAction)!.href}>
            {(action || cfg.defaultAction)!.label}
          </Link>
        </Button>
      )}
    </div>
  );
}
```

---

## Phase 6: Search & Filter Enhancements

### 6.1 Rating Filter

**Add to products filter sidebar:**

```tsx
// src/components/products/RatingFilter.tsx
import { StarRating } from "@/components/product/StarRating";
import { Checkbox } from "@/components/ui/checkbox";

const ratings = [4, 3, 2, 1];

export function RatingFilter({
  selected,
  onChange,
}: {
  selected: number[];
  onChange: (ratings: number[]) => void;
}) {
  return (
    <div className="space-y-3">
      <h4 className="font-medium">Customer Rating</h4>
      {ratings.map((rating) => (
        <label
          key={rating}
          className="flex items-center gap-3 cursor-pointer"
        >
          <Checkbox
            checked={selected.includes(rating)}
            onCheckedChange={(checked) => {
              if (checked) {
                onChange([...selected, rating]);
              } else {
                onChange(selected.filter((r) => r !== rating));
              }
            }}
          />
          <div className="flex items-center gap-2">
            <StarRating rating={rating} size="sm" showValue={false} />
            <span className="text-sm text-muted-foreground">& Up</span>
          </div>
        </label>
      ))}
    </div>
  );
}
```

---

### 6.2 Color Filter

```tsx
// src/components/products/ColorFilter.tsx
const colors = [
  { name: "Black", value: "#000000" },
  { name: "White", value: "#FFFFFF" },
  { name: "Red", value: "#EF4444" },
  { name: "Blue", value: "#3B82F6" },
  { name: "Green", value: "#22C55E" },
  { name: "Silver", value: "#C0C0C0" },
  { name: "Gold", value: "#FFD700" },
];

export function ColorFilter({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (colors: string[]) => void;
}) {
  return (
    <div className="space-y-3">
      <h4 className="font-medium">Color</h4>
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => (
          <button
            key={color.name}
            onClick={() => {
              if (selected.includes(color.name)) {
                onChange(selected.filter((c) => c !== color.name));
              } else {
                onChange([...selected, color.name]);
              }
            }}
            className={`w-8 h-8 rounded-full border-2 transition-all ${
              selected.includes(color.name)
                ? "border-primary scale-110"
                : "border-transparent hover:scale-105"
            }`}
            style={{ backgroundColor: color.value }}
            title={color.name}
          >
            {color.name === "White" && (
              <span className="sr-only">{color.name}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
```

---

## Implementation Priority Checklist

### Week 1: Critical Fixes
- [ ] Fix "CircuitCart" branding → "ElectroMuscial" (global search)
- [ ] Connect checkout to real cart data (Zustand store)
- [ ] Add form validation to checkout (Zod + React Hook Form)
- [ ] Add guest checkout option

### Week 2: PDP Enhancement
- [ ] Implement ProductGallery with zoom & lightbox
- [ ] Add DeliveryEstimator component
- [ ] Create ProductTabs (Reviews, Q&A, Shipping)
- [ ] Add review summary with star breakdown

### Week 3: Cart & Checkout Polish
- [ ] Add promo code input to cart
- [ ] Implement multi-step checkout progress
- [ ] Add order review step
- [ ] Add "Save for Later" functionality

### Week 4: Dashboard & Search
- [ ] Enhance order cards with tracking timeline
- [ ] Connect wishlist to cart (Move to Cart)
- [ ] Add stock alerts for wishlist
- [ ] Add rating and color filters to search

### Week 5: UI/UX Polish
- [ ] Add skeleton loaders to all loading states
- [ ] Implement empty states for all pages
- [ ] Enhance toast notifications
- [ ] Add keyboard navigation & focus management
- [ ] Test responsive breakpoints

---

## Testing Checklist

### Functional Testing
- [ ] Add to cart from product page
- [ ] Update quantity in cart
- [ ] Remove item from cart
- [ ] Apply/remove promo code
- [ ] Complete guest checkout
- [ ] Complete authenticated checkout
- [ ] View order in dashboard
- [ ] Track order status
- [ ] Add/remove wishlist items
- [ ] Move wishlist item to cart
- [ ] Search with filters
- [ ] Product image zoom and lightbox

### Responsive Testing
- [ ] Mobile (320px - 767px)
- [ ] Tablet (768px - 1023px)
- [ ] Desktop (1024px+)

### Accessibility Testing
- [ ] Keyboard navigation through checkout
- [ ] Screen reader compatibility
- [ ] Color contrast ratios
- [ ] Focus indicators visible
- [ ] ARIA labels on interactive elements

---

## Performance Targets

| Metric | Target |
|--------|--------|
| First Contentful Paint (FCP) | < 1.2s |
| Largest Contentful Paint (LCP) | < 2.5s |
| Time to Interactive (TTI) | < 3.8s |
| Cumulative Layout Shift (CLS) | < 0.1 |
| Cart API Response | < 200ms |
| Checkout Completion | < 3 steps |

---

## Notes

- All new components use shadcn/ui primitives (Button, Input, Card, etc.)
- Forms use React Hook Form + Zod for validation
- State management uses Zustand with persistence
- Images use Next.js `<Image>` with proper sizing
- Animations use Framer Motion for page transitions
- Toast notifications use Sonner
- Icons from Lucide React
