# CircuitCart - Electronics E-Commerce Platform Design

## Overview

CircuitCart is a B2C/B2B e-commerce platform for consumer electronics and components with a focus on 2-day shipping capabilities. This design covers TypeScript type definitions, database schema extensions, and feature implementation priorities.

## Type System Architecture

### Core Commerce Types

```typescript
// User & Authentication
interface User {
  id: string;
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Product Catalog
interface Product {
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
  shippingInfo?: ShippingInfo; // 2-day shipping data
  createdAt: Date;
  updatedAt: Date;
}

interface ShippingInfo {
  eligibleForTwoDay: boolean;
  warehouseLocation: string;
  shipsInDays: number;
  estimatedDelivery: Date;
  shippingMethods: ShippingMethod[];
}

interface ShippingMethod {
  id: string;
  name: string;
  price: number;
  estimatedDays: number;
  isTwoDayEligible: boolean;
}
```

### Order & Shipping Types

```typescript
interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  total: number;
  subtotal: number;
  shippingCost: number;
  tax: number;
  shippingAddress: Address;
  items: OrderItem[];
  shipments: Shipment[];
  createdAt: Date;
  updatedAt: Date;
}

interface Shipment {
  id: string;
  orderId: string;
  status: ShipmentStatus;
  carrier: string;
  trackingNumber?: string;
  estimatedDelivery: Date;
  items: OrderItem[];
}

type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
type ShipmentStatus = 'LABEL_CREATED' | 'PICKED_UP' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
```

## Database Schema Extensions

### New Models for Shipping

```prisma
model ShippingMethod {
  id              String    @id @default(cuid())
  name            String
  price           Decimal   @db.Decimal(10, 2)
  estimatedDays   Int
  isTwoDayEligible Boolean @default(false)
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
}

model Product {
  // ... existing fields
  shipsInDays     Int       @default(2)
  twoDayEligible  Boolean   @default(true)
  warehouse       ProductWarehouse[]
}
```

## Feature Implementation Order

### Phase 1: Foundation
1. TypeScript types from flow.md models
2. Extended Prisma schema
3. API routes structure

### Phase 2: Product Catalog
1. Product listing with 2-day shipping badges
2. Product detail pages with delivery estimates
3. Category/brand filtering
4. Search functionality

### Phase 3: Cart & Checkout
1. Shopping cart with shipping estimator
2. Shipping method selection (2-day, standard)
3. Address validation
4. Order summary with delivery dates

### Phase 4: Order Management
1. Order tracking with shipment status
2. Order history
3. Delivery scheduling

## 2-Day Shipping Implementation

### Delivery Calculation Logic

```typescript
function calculateDeliveryDate(
  shipsInDays: number,
  shippingMethod: ShippingMethod,
  address: Address
): Date {
  const today = new Date();
  const shipDate = addBusinessDays(today, shipsInDays);
  return addBusinessDays(shipDate, shippingMethod.estimatedDays);
}

function isTwoDayEligible(
  warehouseLocation: string,
  destinationZone: string
): boolean {
  // Zone-based eligibility matrix
  const eligibleZones = ['west-coast', 'southwest', 'mountain'];
  return eligibleZones.includes(destinationZone);
}
```

### UI Components

1. **ShippingBadge**: "Ships in 2 Days" / "Ships in 3-5 Days"
2. **DeliveryEstimate**: "Arrives by [Day], [Date]"
3. **ShippingSelector**: Radio buttons for shipping methods
4. **ShippingCalculator**: Zip code input with real-time estimates

## API Endpoints

```
GET  /api/products              - List products with shipping info
GET  /api/products/[slug]       - Product detail with delivery estimates
POST /api/shipping/calculate     - Calculate shipping options for address
GET  /api/shipping/methods      - Available shipping methods
POST /api/orders                - Create order with shipping selection
GET  /api/orders/[id]           - Order details with tracking
GET  /api/orders/[id]/shipments - Shipment tracking info
```

## Success Criteria

- All product pages display accurate 2-day shipping eligibility
- Cart shows delivery estimates based on user's zip code
- Checkout allows shipping method selection with price/date comparison
- Order tracking shows real-time shipment status
