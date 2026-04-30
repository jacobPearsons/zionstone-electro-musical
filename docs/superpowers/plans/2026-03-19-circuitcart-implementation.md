# CircuitCart Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an electronics e-commerce platform with comprehensive product catalog, shopping cart, 2-day shipping features, and order management.

**Architecture:** Feature-by-feature implementation starting with TypeScript types and Prisma schema, then product catalog with shipping badges, cart with delivery calculations, checkout flow, and order management.

**Tech Stack:** Next.js 14, TypeScript, Prisma, PostgreSQL, Tailwind CSS, Clerk Auth, Stripe

---

## File Structure Overview

```
src/
├── types/                    # TypeScript type definitions
│   ├── index.ts
│   ├── product.ts
│   ├── cart.ts
│   ├── order.ts
│   ├── shipping.ts
│   └── user.ts
├── lib/
│   ├── shipping.ts           # 2-day shipping calculations
│   └── utils.ts
├── components/
│   ├── shipping/             # Shipping-related components
│   │   ├── ShippingBadge.tsx
│   │   ├── DeliveryEstimate.tsx
│   │   ├── ShippingSelector.tsx
│   │   └── ShippingCalculator.tsx
│   ├── product/
│   │   ├── ProductCard.tsx
│   │   ├── ProductGrid.tsx
│   │   └── ProductFilters.tsx
│   └── cart/
│       ├── CartItem.tsx
│       └── CartSummary.tsx
├── app/
│   ├── products/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── cart/page.tsx
│   └── api/
│       ├── products/
│       ├── shipping/
│       └── orders/
prisma/
├── schema.prisma             # Extended schema with shipping models
└── seed.ts
```

---

## Part 1: Foundation - TypeScript Types

### Task 1: Create Core Type Definitions

**Files:**
- Create: `src/types/index.ts`
- Create: `src/types/product.ts`
- Create: `src/types/shipping.ts`
- Create: `src/types/cart.ts`
- Create: `src/types/order.ts`
- Create: `src/types/user.ts`

- [ ] **Step 1: Create `src/types/product.ts`**

```typescript
import type { Category, Brand, ProductImage, ProductFeature, Review } from './index';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  sku?: string;
  inventory: number;
  categoryId: string;
  brandId?: string;
  images: ProductImage[];
  features: ProductFeature[];
  reviews: Review[];
  shippingInfo?: ShippingInfo;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  productId: string;
  position: number;
}

export interface ProductFeature {
  id: string;
  name: string;
  value: string;
  productId: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
}
```

- [ ] **Step 2: Create `src/types/shipping.ts`**

```typescript
export interface ShippingInfo {
  eligibleForTwoDay: boolean;
  warehouseLocation: string;
  shipsInDays: number;
  estimatedDelivery?: Date;
  shippingMethods: ShippingMethod[];
}

export interface ShippingMethod {
  id: string;
  name: string;
  price: number;
  estimatedDays: number;
  isTwoDayEligible: boolean;
}

export interface ShippingCalculation {
  zipCode: string;
  methods: ShippingMethod[];
  estimatedDeliveryDates: Record<string, Date>;
}

export type ShippingZone = 'west-coast' | 'southwest' | 'mountain' | 'midwest' | 'east-coast' | 'alaska' | 'hawaii';
```

- [ ] **Step 3: Create `src/types/cart.ts`**

```typescript
import type { Product } from './product';
import type { ShippingMethod } from './shipping';

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  shippingMethod?: ShippingMethod;
  estimatedDelivery?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  id: string;
  cartId: string;
  product: Product;
  productId: string;
  quantity: number;
  lineTotal: number;
}
```

- [ ] **Step 4: Create `src/types/order.ts`**

```typescript
import type { Address } from './user';
import type { ShippingMethod } from './shipping';

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  shippingAddress: Address;
  shippingMethod: ShippingMethod;
  items: OrderItem[];
  shipments: Shipment[];
  stripePaymentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  lineTotal: number;
}

export interface Shipment {
  id: string;
  orderId: string;
  status: ShipmentStatus;
  carrier: string;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery: Date;
  actualDelivery?: Date;
  items: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type ShipmentStatus = 'LABEL_CREATED' | 'PICKED_UP' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
```

- [ ] **Step 5: Create `src/types/user.ts`**

```typescript
export interface User {
  id: string;
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}
```

- [ ] **Step 6: Create `src/types/index.ts`**

```typescript
export * from './product';
export * from './shipping';
export * from './cart';
export * from './order';
export * from './user';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
```

- [ ] **Step 7: Commit**

```bash
git add src/types/ && git commit -m "feat: Add TypeScript type definitions for CircuitCart"
```

---

### Task 2: Extend Prisma Schema with Shipping Models

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `src/lib/prisma.ts`

- [ ] **Step 1: Update `prisma/schema.prisma` - add shipping models**

Add after the existing Address model:

```prisma
model ShippingMethod {
  id              String    @id @default(cuid())
  name            String
  description     String?
  price           Decimal   @db.Decimal(10, 2)
  estimatedDays   Int
  isTwoDayEligible Boolean  @default(false)
  isActive        Boolean   @default(true)
  orders          Order[]
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model Warehouse {
  id            String    @id @default(cuid())
  name          String
  location      String
  address       String
  city          String
  state         String
  postalCode    String
  country       String    @default("US")
  products      ProductWarehouse[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model ProductWarehouse {
  id            String    @id @default(cuid())
  product       Product   @relation(fields: [productId], references: [id])
  productId     String
  warehouse     Warehouse @relation(fields: [warehouseId], references: [id])
  warehouseId   String
  quantity      Int       @default(0)
  reserved      Int       @default(0)
  
  @@unique([productId, warehouseId])
  @@index([productId])
  @@index([warehouseId])
}

model Product {
  // ... existing fields
  shipsInDays      Int       @default(2)
  twoDayEligible   Boolean   @default(true)
  warehouse        ProductWarehouse[]
}

model Order {
  // ... existing fields
  shippingMethod   ShippingMethod? @relation(fields: [shippingMethodId], references: [id])
  shippingMethodId String?
}
```

- [ ] **Step 2: Run Prisma generate**

```bash
npm run db:generate
```

- [ ] **Step 3: Commit**

```bash
git add prisma/schema.prisma && git commit -m "feat: Extend Prisma schema with shipping models"
```

---

## Part 2: Shipping Calculation Library

### Task 3: Create Shipping Calculation Logic

**Files:**
- Create: `src/lib/shipping.ts`

- [ ] **Step 1: Create `src/lib/shipping.ts`**

```typescript
import type { ShippingMethod, ShippingZone, ShippingCalculation } from '@/types/shipping';

const ZONE_MAP: Record<string, ShippingZone> = {
  '00': 'west-coast',
  '01': 'west-coast',
  '02': 'southwest',
  '03': 'mountain',
  '04': 'mountain',
  '05': 'midwest',
  '06': 'midwest',
  '07': 'midwest',
  '08': 'midwest',
  '09': 'east-coast',
  '10': 'east-coast',
  '11': 'east-coast',
  '12': 'east-coast',
  '13': 'alaska',
  '14': 'hawaii',
};

const TWO_DAY_ELIGIBLE_ZONES: ShippingZone[] = ['west-coast', 'southwest', 'mountain', 'midwest'];

export const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: 'std',
    name: 'Standard Shipping',
    price: 5.99,
    estimatedDays: 5,
    isTwoDayEligible: false,
  },
  {
    id: 'exp',
    name: 'Express Shipping',
    price: 12.99,
    estimatedDays: 2,
    isTwoDayEligible: true,
  },
  {
    id: 'overn',
    name: 'Overnight Shipping',
    price: 24.99,
    estimatedDays: 1,
    isTwoDayEligible: true,
  },
];

export function getZoneFromZipCode(zipCode: string): ShippingZone {
  const prefix = zipCode.substring(0, 2);
  return ZONE_MAP[prefix] || 'midwest';
}

export function isTwoDayShippingEligible(zipCode: string): boolean {
  const zone = getZoneFromZipCode(zipCode);
  return TWO_DAY_ELIGIBLE_ZONES.includes(zone);
}

function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date);
  let addedDays = 0;
  
  while (addedDays < days) {
    result.setDate(result.getDate() + 1);
    const dayOfWeek = result.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      addedDays++;
    }
  }
  
  return result;
}

export function calculateDeliveryDate(
  shipsInDays: number,
  estimatedDays: number,
  fromZipCode?: string
): Date {
  const today = new Date();
  const cutoffHour = 14; // 2 PM cutoff for same-day shipping
  
  let shipDate = new Date(today);
  if (today.getHours() < cutoffHour) {
    shipDate.setDate(shipDate.getDate() + shipsInDays);
  } else {
    shipDate.setDate(shipDate.getDate() + shipsInDays + 1);
  }
  
  while (shipDate.getDay() === 0 || shipDate.getDay() === 6) {
    shipDate.setDate(shipDate.getDate() + 1);
  }
  
  return addBusinessDays(shipDate, estimatedDays);
}

export function calculateShipping(
  zipCode: string,
  shipsInDays: number = 2
): ShippingCalculation {
  const isEligible = isTwoDayShippingEligible(zipCode);
  
  const methods = SHIPPING_METHODS.map(method => ({
    ...method,
    price: method.price,
    estimatedDays: method.estimatedDays,
    isTwoDayEligible: isEligible && method.isTwoDayEligible,
  }));
  
  const estimatedDeliveryDates: Record<string, Date> = {};
  
  for (const method of methods) {
    estimatedDeliveryDates[method.id] = calculateDeliveryDate(shipsInDays, method.estimatedDays);
  }
  
  return {
    zipCode,
    methods,
    estimatedDeliveryDates,
  };
}

export function formatDeliveryDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

export function getShippingBadgeText(shipsInDays: number, isTwoDayEligible: boolean): string {
  if (isTwoDayEligible && shipsInDays <= 2) {
    return 'Ships in 2 Days';
  }
  return `Ships in ${shipsInDays} Days`;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/shipping.ts && git commit -m "feat: Add shipping calculation logic with 2-day shipping support"
```

---

## Part 3: Shipping UI Components

### Task 4: Create Shipping Badge Component

**Files:**
- Create: `src/components/shipping/ShippingBadge.tsx`

- [ ] **Step 1: Create `src/components/shipping/ShippingBadge.tsx`**

```typescript
'use client';

import { CheckCircle, Truck } from 'lucide-react';

interface ShippingBadgeProps {
  shipsInDays: number;
  twoDayEligible: boolean;
  className?: string;
}

export function ShippingBadge({ shipsInDays, twoDayEligible, className = '' }: ShippingBadgeProps) {
  if (twoDayEligible && shipsInDays <= 2) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded ${className}`}>
        <CheckCircle className="w-3.5 h-3.5" />
        <span>Ships in 2 Days</span>
      </div>
    );
  }
  
  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded ${className}`}>
      <Truck className="w-3.5 h-3.5" />
      <span>Ships in {shipsInDays} Days</span>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/shipping/ShippingBadge.tsx && git commit -m "feat: Add ShippingBadge component"
```

---

### Task 5: Create Delivery Estimate Component

**Files:**
- Create: `src/components/shipping/DeliveryEstimate.tsx`

- [ ] **Step 1: Create `src/components/shipping/DeliveryEstimate.tsx`**

```typescript
'use client';

import { Calendar, Truck } from 'lucide-react';
import { formatDeliveryDate } from '@/lib/shipping';

interface DeliveryEstimateProps {
  estimatedDelivery: Date;
  shippingMethodName: string;
  className?: string;
}

export function DeliveryEstimate({ estimatedDelivery, shippingMethodName, className = '' }: DeliveryEstimateProps) {
  const formattedDate = formatDeliveryDate(estimatedDelivery);
  const today = new Date();
  const daysUntilDelivery = Math.ceil((estimatedDelivery.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  return (
    <div className={`flex items-start gap-3 p-3 bg-blue-50 rounded-lg ${className}`}>
      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
        <Calendar className="w-5 h-5 text-blue-600" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-900">
          Arrives by <span className="text-blue-600">{formattedDate}</span>
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          {shippingMethodName} • {daysUntilDelivery} days
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/shipping/DeliveryEstimate.tsx && git commit -m "feat: Add DeliveryEstimate component"
```

---

### Task 6: Create Shipping Selector Component

**Files:**
- Create: `src/components/shipping/ShippingSelector.tsx`

- [ ] **Step 1: Create `src/components/shipping/ShippingSelector.tsx`**

```typescript
'use client';

import { useState } from 'react';
import { CheckCircle, Truck, Zap, Rocket } from 'lucide-react';
import type { ShippingMethod } from '@/types/shipping';
import { formatDeliveryDate } from '@/lib/shipping';

interface ShippingSelectorProps {
  methods: ShippingMethod[];
  estimatedDeliveryDates: Record<string, Date>;
  selectedMethodId: string;
  onSelect: (method: ShippingMethod) => void;
  className?: string;
}

const METHOD_ICONS: Record<string, React.ElementType> = {
  std: Truck,
  exp: Zap,
  overn: Rocket,
};

export function ShippingSelector({
  methods,
  estimatedDeliveryDates,
  selectedMethodId,
  onSelect,
  className = '',
}: ShippingSelectorProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="text-sm font-medium text-gray-900">Shipping Method</h3>
      
      {methods.map((method) => {
        const Icon = METHOD_ICONS[method.id] || Truck;
        const deliveryDate = estimatedDeliveryDates[method.id];
        const isSelected = selectedMethodId === method.id;
        
        return (
          <label
            key={method.id}
            className={`relative flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
              isSelected
                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              name="shipping-method"
              value={method.id}
              checked={isSelected}
              onChange={() => onSelect(method)}
              className="sr-only"
            />
            
            <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              isSelected ? 'border-primary' : 'border-gray-300'
            }`}>
              {isSelected && (
                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-gray-900">{method.name}</span>
                {method.isTwoDayEligible && (
                  <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded">
                    2-Day
                  </span>
                )}
              </div>
              
              {deliveryDate && (
                <p className="text-sm text-gray-500 mt-1">
                  Arrives by {formatDeliveryDate(deliveryDate)}
                </p>
              )}
            </div>
            
            <span className="text-sm font-semibold text-gray-900">
              ${method.price.toFixed(2)}
            </span>
          </label>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/shipping/ShippingSelector.tsx && git commit -m "feat: Add ShippingSelector component"
```

---

### Task 7: Create Shipping Calculator Component

**Files:**
- Create: `src/components/shipping/ShippingCalculator.tsx`

- [ ] **Step 1: Create `src/components/shipping/ShippingCalculator.tsx`**

```typescript
'use client';

import { useState } from 'react';
import { MapPin, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { calculateShipping, formatDeliveryDate } from '@/lib/shipping';
import type { ShippingMethod } from '@/types/shipping';

interface ShippingCalculatorProps {
  onCalculate: (method: ShippingMethod, deliveryDate: Date) => void;
  className?: string;
}

export function ShippingCalculator({ onCalculate, className = '' }: ShippingCalculatorProps) {
  const [zipCode, setZipCode] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<ShippingMethod | null>(null);
  
  const handleCalculate = () => {
    if (zipCode.length === 5 && /^\d+$/.test(zipCode)) {
      setIsValid(true);
      setShowOptions(true);
    } else {
      setIsValid(false);
    }
  };
  
  const handleMethodSelect = (method: ShippingMethod) => {
    setSelectedMethod(method);
  };
  
  const handleApply = () => {
    if (selectedMethod) {
      const calculation = calculateShipping(zipCode);
      const deliveryDate = calculation.estimatedDeliveryDates[selectedMethod.id];
      onCalculate(selectedMethod, deliveryDate);
    }
  };
  
  if (showOptions && isValid) {
    const calculation = calculateShipping(zipCode);
    
    return (
      <div className={`p-4 border border-gray-200 rounded-lg bg-white ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium">Shipping to {zipCode}</span>
          <Check className="w-4 h-4 text-green-500" />
        </div>
        
        <div className="space-y-2 mb-4">
          {calculation.methods.map((method) => {
            const deliveryDate = calculation.estimatedDeliveryDates[method.id];
            const isSelected = selectedMethod?.id === method.id;
            
            return (
              <label
                key={method.id}
                className={`flex items-center justify-between p-3 border rounded cursor-pointer transition-colors ${
                  isSelected ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="calc-method"
                    checked={isSelected}
                    onChange={() => handleMethodSelect(method)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? 'border-primary' : 'border-gray-300'
                  }`}>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{method.name}</p>
                    {deliveryDate && (
                      <p className="text-xs text-gray-500">
                        Arrives {formatDeliveryDate(deliveryDate)}
                      </p>
                    )}
                  </div>
                </div>
                <span className="font-medium">${method.price.toFixed(2)}</span>
              </label>
            );
          })}
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowOptions(false)} className="flex-1">
            Change ZIP
          </Button>
          <Button onClick={handleApply} disabled={!selectedMethod} className="flex-1">
            Apply
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`p-4 border border-gray-200 rounded-lg bg-white ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Calculate Shipping
      </label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Enter ZIP code"
            value={zipCode}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 5);
              setZipCode(value);
              setIsValid(null);
            }}
            className={`pl-9 ${isValid === false ? 'border-red-500' : ''}`}
          />
        </div>
        <Button onClick={handleCalculate} disabled={zipCode.length !== 5}>
          Calculate
        </Button>
      </div>
      {isValid === false && (
        <p className="text-xs text-red-500 mt-1">Please enter a valid 5-digit ZIP code</p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/shipping/ShippingCalculator.tsx && git commit -m "feat: Add ShippingCalculator component"
```

---

## Part 4: Product Catalog with Shipping

### Task 8: Update Product Card with Shipping Badge

**Files:**
- Modify: `src/components/product/ProductCard.tsx` (create if not exists)
- Modify: `src/app/products/page.tsx`

- [ ] **Step 1: Create `src/components/product/ProductCard.tsx`**

```typescript
import Link from 'next/link';
import Image from 'next/image';
import { ShippingBadge } from '@/components/shipping/ShippingBadge';
import { Button } from '@/components/ui/button';
import type { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const primaryImage = product.images[0];
  
  return (
    <div className="group rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
      <Link href={`/products/${product.slug}`}>
        <div className="aspect-[4/3] relative bg-gray-100">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt || product.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">
              🔌
            </div>
          )}
          {product.shippingInfo && (
            <div className="absolute top-2 left-2">
              <ShippingBadge
                shipsInDays={product.shippingInfo.shipsInDays}
                twoDayEligible={product.shippingInfo.eligibleForTwoDay}
              />
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        
        {product.brand && (
          <p className="text-sm text-muted-foreground mt-1">{product.brand.name}</p>
        )}
        
        <div className="flex items-center gap-2 mt-2">
          <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-sm text-muted-foreground line-through">
              ${product.comparePrice.toFixed(2)}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2 mt-3">
          {product.inventory > 0 ? (
            <span className="text-xs text-green-600">In Stock</span>
          ) : (
            <span className="text-xs text-red-600">Out of Stock</span>
          )}
        </div>
        
        <Button className="w-full mt-3" disabled={product.inventory === 0}>
          Add to Cart
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update `src/app/products/page.tsx`**

Update the page to use ProductCard and add 2-day shipping data mock.

- [ ] **Step 3: Commit**

```bash
git add src/components/product/ProductCard.tsx src/app/products/page.tsx && git commit -m "feat: Add ProductCard with shipping badge integration"
```

---

### Task 9: Update Product Detail Page

**Files:**
- Modify: `src/app/products/[slug]/page.tsx`

- [ ] **Step 1: Update product detail page with shipping info and delivery estimate**

Add shipping information section showing delivery estimate and shipping options.

- [ ] **Step 2: Commit**

```bash
git add src/app/products/\[slug\]/page.tsx && git commit -m "feat: Add shipping info to product detail page"
```

---

## Part 5: Cart with Shipping

### Task 10: Update Cart Page with Shipping Calculator

**Files:**
- Modify: `src/app/cart/page.tsx`

- [ ] **Step 1: Update cart page to include shipping calculator and delivery estimate**

- [ ] **Step 2: Commit**

```bash
git add src/app/cart/page.tsx && git commit -m "feat: Add shipping calculator to cart page"
```

---

## Part 6: API Routes

### Task 11: Create Shipping API Routes

**Files:**
- Create: `src/app/api/shipping/calculate/route.ts`
- Create: `src/app/api/shipping/methods/route.ts`

- [ ] **Step 1: Create `src/app/api/shipping/calculate/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { calculateShipping } from '@/lib/shipping';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { zipCode, shipsInDays } = body;
    
    if (!zipCode || zipCode.length !== 5) {
      return NextResponse.json(
        { error: 'Valid ZIP code required' },
        { status: 400 }
      );
    }
    
    const result = calculateShipping(zipCode, shipsInDays || 2);
    
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to calculate shipping' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Create `src/app/api/shipping/methods/route.ts`**

```typescript
import { NextResponse } from 'next/server';
import { SHIPPING_METHODS } from '@/lib/shipping';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: SHIPPING_METHODS,
  });
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/shipping/ && git commit -m "feat: Add shipping API routes"
```

---

## Part 7: Testing

### Task 12: Add Shipping Calculations Tests

**Files:**
- Create: `src/lib/__tests__/shipping.test.ts`

- [ ] **Step 1: Create shipping calculation tests**

- [ ] **Step 2: Run tests**

```bash
npm test
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/__tests__/shipping.test.ts && git commit -m "test: Add shipping calculation tests"
```

---

## Summary

| Part | Task | Status |
|------|------|--------|
| 1 | TypeScript Types | Pending |
| 2 | Prisma Schema Extensions | Pending |
| 3 | Shipping Library | Pending |
| 4 | ShippingBadge Component | Pending |
| 5 | DeliveryEstimate Component | Pending |
| 6 | ShippingSelector Component | Pending |
| 7 | ShippingCalculator Component | Pending |
| 8 | ProductCard Updates | Pending |
| 9 | Product Detail Updates | Pending |
| 10 | Cart Page Updates | Pending |
| 11 | API Routes | Pending |
| 12 | Testing | Pending |
