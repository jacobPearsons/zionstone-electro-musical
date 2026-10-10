# Technical Specifications & Compatibility Checker Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add tabbed product detail interface with specs table and compatibility checker to the ElectroMuscial Store e-commerce site.

**Architecture:** 
- Add shadcn/ui Tabs component for tabbed product info
- Create SpecsTable component for structured specifications display
- Create CompatibilityChecker component for accessory recommendations
- Update products page to handle URL params for compatible filtering

**Tech Stack:** Next.js, React, shadcn/ui, Tailwind, TypeScript

**Note on Type Location:** The Product interface lives in `src/data/products.ts` (used by all pages/components), not `src/types/product.ts` (which has a different DB/API structure).

---

## File Structure

### New Files
- `src/components/product/ProductTabs.tsx` - Tabbed interface wrapper
- `src/components/product/SpecsTable.tsx` - Specs table component
- `src/components/product/CompatibilityChecker.tsx` - Compatibility section

### Modified Files
- `src/data/products.ts` - Add specs and compatibility to Product interface and data
- `src/app/products/[slug]/page.tsx` - Use new components, remove old features section
- `src/app/products/page.tsx` - Add URL param handling for compatible filter

---

## Task 1: Install shadcn/ui Components

**Files:**
- Modify: `package.json` (via CLI)

- [ ] **Step 1: Install Tabs component**

Run: `npx shadcn@latest add tabs`
Expected: Tabs component installed in `src/components/ui/tabs.tsx`

- [ ] **Step 2: Install Table component**

Run: `npx shadcn@latest add table`
Expected: Table component installed in `src/components/ui/table.tsx`

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: add shadcn/ui tabs and table components"
```

---

## Task 2: Update Product Type in Data File

**Files:**
- Modify: `src/data/products.ts:1-18`

- [ ] **Step 1: Update Product interface**

Replace the Product interface (lines 1-18) with:

```typescript
export type CompatibilityCategory = 'cases' | 'stands' | 'bags' | 'cables' | 'accessories';

export interface ProductSpecs {
  general?: Record<string, string>;
  dimensions?: Record<string, string>;
  connectivity?: string[];
  power?: string[];
  audio?: Record<string, string>;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  category: string;
  slug: string;
  emoji: string;
  shipsInDays: number;
  twoDayEligible: boolean;
  rating: number;
  reviews: number;
  description?: string;
  features?: string[];
  inventory?: number;
  images?: string[];
  specs?: ProductSpecs;
  compatibility?: CompatibilityCategory[];
}
```

- [ ] **Step 2: Add helper function for compatibility**

Add at end of file, after the products array export:

```typescript
export function getCompatibleCount(category: CompatibilityCategory, productCategory: string): number {
  return products.filter(product => 
    product.category === category && 
    product.compatibility?.includes(productCategory as CompatibilityCategory)
  ).length;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/data/products.ts && git commit -m "feat: add specs and compatibility types to Product"
```

---

## Task 3: Create SpecsTable Component

**Files:**
- Create: `src/components/product/SpecsTable.tsx`

- [ ] **Step 1: Create the component**

```typescript
'use client';

import { Check } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { ProductSpecs } from '@/data/products';

interface SpecsTableProps {
  specs?: ProductSpecs;
  features?: string[];
}

const categoryLabels: Record<string, string> = {
  general: 'General',
  dimensions: 'Dimensions',
  connectivity: 'Connectivity',
  power: 'Power',
  audio: 'Audio',
};

export function SpecsTable({ specs, features }: SpecsTableProps) {
  const hasSpecs = specs && Object.keys(specs).length > 0;
  const hasFeatures = features && features.length > 0;

  if (!hasSpecs && !hasFeatures) {
    return (
      <p className="text-muted-foreground py-8 text-center">
        No specifications available for this product.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {hasFeatures && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Key Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-yellow-600" />
                </div>
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {specs && Object.entries(specs).map(([category, items]) => {
        if (!items || (Array.isArray(items) && items.length === 0)) return null;
        if (!Array.isArray(items) && Object.keys(items).length === 0) return null;

        return (
          <div key={category}>
            <h4 className="text-md font-semibold mb-3">{categoryLabels[category] || category}</h4>
            <Table>
              <TableBody>
                {Array.isArray(items) ? (
                  items.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{item}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  Object.entries(items).map(([key, value]) => (
                    <TableRow key={key}>
                      <TableCell className="font-medium w-1/3">{key}</TableCell>
                      <TableCell>{value}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/product/SpecsTable.tsx && git commit -m "feat: create SpecsTable component"
```

---

## Task 4: Create ProductTabs Component

**Files:**
- Create: `src/components/product/ProductTabs.tsx`

- [ ] **Step 1: Create the component**

```typescript
'use client';

import { FileText, List } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SpecsTable } from './SpecsTable';
import type { ProductSpecs } from '@/data/products';

interface ProductTabsProps {
  description?: string;
  specs?: ProductSpecs;
  features?: string[];
}

export function ProductTabs({ description, specs, features }: ProductTabsProps) {
  return (
    <Tabs defaultValue="description" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="description" className="gap-2">
          <FileText className="w-4 h-4" />
          Description
        </TabsTrigger>
        <TabsTrigger value="specifications" className="gap-2">
          <List className="w-4 h-4" />
          Specifications
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="description" className="mt-6">
        <p className="text-muted-foreground leading-relaxed">
          {description || 'No description available.'}
        </p>
      </TabsContent>
      
      <TabsContent value="specifications" className="mt-6">
        <SpecsTable specs={specs} features={features} />
      </TabsContent>
    </Tabs>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/product/ProductTabs.tsx && git commit -m "feat: create ProductTabs component"
```

---

## Task 5: Create CompatibilityChecker Component

**Files:**
- Create: `src/components/product/CompatibilityChecker.tsx`

- [ ] **Step 1: Create the component**

```typescript
'use client';

import Link from 'next/link';
import { Briefcase, ArrowUpFromLine, ShoppingBag, Cable, Wrench } from 'lucide-react';
import { getCompatibleCount } from '@/data/products';
import type { CompatibilityCategory } from '@/data/products';

interface CompatibilityCheckerProps {
  compatibility?: CompatibilityCategory[];
  productSlug: string;
  productCategory: string;
}

const categoryConfig: Record<CompatibilityCategory, { icon: React.ReactNode; label: string }> = {
  cases: { icon: <Briefcase className="w-4 h-4" />, label: 'Cases' },
  stands: { icon: <ArrowUpFromLine className="w-4 h-4" />, label: 'Stands' },
  bags: { icon: <ShoppingBag className="w-4 h-4" />, label: 'Bags' },
  cables: { icon: <Cable className="w-4 h-4" />, label: 'Cables' },
  accessories: { icon: <Wrench className="w-4 h-4" />, label: 'Accessories' },
};

export function CompatibilityChecker({ compatibility, productSlug, productCategory }: CompatibilityCheckerProps) {
  if (!compatibility || compatibility.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold">Compatible With</h3>
      <div className="flex flex-wrap gap-2">
        {compatibility.map((cat) => {
          const count = getCompatibleCount(cat, productCategory);
          const config = categoryConfig[cat];
          
          return (
            <Link
              key={cat}
              href={`/products?category=${cat}&compatible=${productSlug}`}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border hover:border-purple-500 hover:bg-yellow-50 transition-colors"
            >
              {config.icon}
              <span className="text-sm">{config.label}</span>
              <span className="text-xs text-muted-foreground">({count})</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/product/CompatibilityChecker.tsx && git commit -m "feat: create CompatibilityChecker component"
```

---

## Task 6: Update Product Detail Page

**Files:**
- Modify: `src/app/products/[slug]/page.tsx`

First, read the current file to understand the structure before editing.

- [ ] **Step 1: Add imports**

Add after existing imports:
```typescript
import { ProductTabs } from '@/components/product/ProductTabs';
import { CompatibilityChecker } from '@/components/product/CompatibilityChecker';
```

- [ ] **Step 2: Replace description and features with ProductTabs**

Find the section that contains:
- The description paragraph (`<p className="text-muted-foreground mb-6 leading-relaxed">`)
- The Features section at the bottom (starting with `"{/* Features Section */}"`)

Replace both with:
```typescript
{/* Tabbed Content */}
<ProductTabs
  description={product.description}
  specs={product.specs}
  features={product.features}
/>
```

- [ ] **Step 3: Add CompatibilityChecker before Trust Badges**

Find the Trust Badges section (the grid with Shield, RotateCcw, Truck icons) and add CompatibilityChecker before it:

```typescript
{/* Compatibility Checker */}
<CompatibilityChecker
  compatibility={product.compatibility}
  productSlug={product.slug}
  productCategory={product.category}
/>

{/* Trust Badges */}
<div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl">
```

- [ ] **Step 4: Commit**

```bash
git add src/app/products/\[slug\]/page.tsx && git commit -m "feat: integrate ProductTabs and CompatibilityChecker into product detail"
```

---

## Task 7: Add Data to Products

**Files:**
- Modify: `src/data/products.ts`

- [ ] **Step 1: Add specs and compatibility to Fender Stratocaster**

Find the Fender Stratocaster product (id "1", slug "fender-stratocaster-player") and add the new fields after the existing fields:

```typescript
compatibility: ['cases', 'stands', 'cables', 'accessories'],
specs: {
  general: {
    'Body Shape': 'Stratocaster',
    'Body Material': 'Alder',
    'Finish': 'Gloss Polyester',
    'Neck Material': 'Maple',
    'Neck Shape': 'Modern C',
    'Fretboard': 'Maple (22 frets)',
    'Nut': 'Synthetic Bone',
    'Tuners': 'Sealed Die-Cast',
  },
  connectivity: ['1/4" Output', '5-Way Selector Switch'],
  audio: {
    'Pickups': '3x Player Series Single-Coil Strat',
    'Controls': 'Volume, Tone (x2)',
    'Bridge': '2-Point Synchronized Tremolo',
  },
  dimensions: {
    'Scale Length': '25.5" (648 mm)',
    'Nut Width': '1.650" (42 mm)',
  },
},
```

- [ ] **Step 2: Add specs and compatibility to Roland SPD-SX**

Find the Roland SPD-SX product (id "14", slug "roland-spd-sx-limited-edition") and add:

```typescript
compatibility: ['cases', 'accessories', 'cables'],
specs: {
  general: {
    'Pads': '9 rubber pads with LED indicators',
    'Internal Memory': '16 GB',
    'Sample Format': '44.1 kHz/16-bit WAV',
    'Max Recording Time': '~50 hours mono',
    'Polyphony': '20 voices',
  },
  connectivity: ['Stereo Mix Output (L/R)', 'Headphone Out', 'MIDI I/O', 'USB (Audio/MIDI)', '4x External Trigger Inputs', 'Expression Pedal'],
  power: ['AC Adapter (included)', 'USB Bus Power'],
  dimensions: {
    'Width': '340 mm (13.4")',
    'Depth': '251 mm (9.9")',
    'Height': '86 mm (3.4")',
    'Weight': '2.4 kg (5 lbs 5 oz)',
  },
},
```

- [ ] **Step 3: Commit**

```bash
git add src/data/products.ts && git commit -m "feat: add specs and compatibility data to products"
```

---

## Task 8: Update Products Page for Compatible Filter

**Files:**
- Modify: `src/app/products/page.tsx`

First, read the current file to understand the structure.

- [ ] **Step 1: Add imports**

Add to imports:
```typescript
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
```

- [ ] **Step 2: Create inner component**

Replace the current function with:

```typescript
function ProductsPageContent() {
  const searchParams = useSearchParams();
  const compatibleSlug = searchParams.get('compatible');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get('category') || null
  );
  // ... rest of existing state
  
  // Add compatible filter to useMemo
  const filteredProducts = useMemo(() => {
    let result = [...products];
    
    if (searchQuery) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory) {
      result = result.filter(p => p.category === selectedCategory);
    }

    if (selectedBrands.length > 0) {
      result = result.filter(p => selectedBrands.includes(p.brand));
    }

    if (selectedPriceRange) {
      result = result.filter(p => 
        p.price >= selectedPriceRange.min && p.price < selectedPriceRange.max
      );
    }

    if (twoDayOnly) {
      result = result.filter(p => p.twoDayEligible);
    }

    // Compatible filter
    if (compatibleSlug) {
      const sourceProduct = products.find(p => p.slug === compatibleSlug);
      if (sourceProduct) {
        result = result.filter(p => 
          p.category === selectedCategory &&
          p.compatibility?.includes(sourceProduct.category as any)
        );
      }
    }

    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
    }

    return result;
  }, [searchQuery, selectedCategory, selectedBrands, selectedPriceRange, twoDayOnly, sortBy, compatibleSlug]);
  
  // ... rest of component
}
```

- [ ] **Step 3: Wrap in Suspense**

Replace the default export:

```typescript
export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading...</div>}>
      <ProductsPageContent />
    </Suspense>
  );
}
```

- [ ] **Step 4: Add compatible badge to product cards**

In the product card div (inside filteredProducts.map), add a badge when viewing compatible products. Find the location where other badges are rendered (like ShippingBadge) and add:

```typescript
{compatibleSlug && (
  <div className="absolute top-3 right-3 bg-yellow-600 text-white text-xs px-2 py-1 rounded">
    Fits this product
  </div>
)}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/products/page.tsx && git commit -m "feat: add URL param handling for compatible products filter"
```

---

## Task 9: Final Verification

- [ ] **Step 1: Run lint**

Run: `npm run lint`
Expected: No errors

- [ ] **Step 2: Verify build**

Run: `npm run build` (or check for build errors in dev)
Expected: No TypeScript errors

- [ ] **Step 3: Final commit**

```bash
git add -A && git commit -m "feat: complete specs table and compatibility checker features"
```

---

## Acceptance Criteria Checklist

- [ ] Tabbed interface renders Description and Specifications tabs
- [ ] Description tab shows product description text
- [ ] Specifications tab shows Features as checkmark grid (2 columns)
- [ ] Specifications tab shows Tech Specs in categorized tables (when specs exist)
- [ ] Products without specs show only Features section
- [ ] Compatibility section shows category cards with icons and item counts
- [ ] Clicking category card navigates to `/products?category=X&compatible=Y`
- [ ] Products page shows compatible products when `?compatible` param is present
- [ ] Compatible products show "Fits this product" badge
- [ ] All lint checks pass
