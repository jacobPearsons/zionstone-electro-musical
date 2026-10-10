# Technical Specifications & Compatibility Checker

**Date:** 2026-03-19  
**Status:** Approved

## Overview

Add two new sections to the product detail page:

1. **Technical Specifications Table** - Tabbed interface with features list and structured specs
2. **Compatibility Checker** - Shows compatible accessories and links to filtered products

---

## Installation Requirements

Install required shadcn/ui components:
```bash
npx shadcn@latest add tabs table
```

---

## 1. Technical Specifications Table

### Implementation

**Tabbed Interface**
- Add tabs to product detail page: `Description` | `Specifications`
- Default to `Description` tab
- Use shadcn/ui `Tabs` component
- Icons: `FileText` for Description, `List` for Specifications

**Specifications Tab Content**
- **Key Features** section (move from existing location):
  - Bullet list from `product.features` array
  - Checkmark icons (lucide `Check`)
  - Grid layout (2 columns on desktop, 1 on mobile)
  - Section heading: "Key Features"

- **Technical Specs** section:
  - Structured key-value tables using shadcn/ui `Table`
  - Categories: General, Dimensions, Connectivity, Power, Audio
  - Only render categories that have data
  - Each category has subheading and table
  - Add to Product type as optional `specs` object

**Type Extension** (in `src/types/product.ts`)
```typescript
interface ProductSpecs {
  general?: Record<string, string>;
  dimensions?: Record<string, string>;
  connectivity?: string[];
  power?: string[];
  audio?: Record<string, string>;
}

interface Product {
  // ... existing fields
  specs?: ProductSpecs;
}
```

### File Changes
- `src/types/product.ts` - Add `specs` field to Product interface
- `src/app/products/[slug]/page.tsx` - Refactor to use tabbed interface, remove existing Key Features section
- `src/components/product/ProductTabs.tsx` - New Tabs component wrapping Description and Specifications
- `src/components/product/SpecsTable.tsx` - New specs table component for structured key-value display

---

## 2. Compatibility Checker

### Implementation

**"Compatible With" Section**
- Located below Add to Cart section, above Trust Badges
- Shows compatible product categories as clickable cards
- Each card shows: category icon + name + "X items" count
- Clicking navigates to `/products?category={category}&compatible={product.slug}`

**Category Mapping**
| Category | Icon | Label |
|----------|------|-------|
| cases | `Briefcase` | Cases |
| stands | `ArrowUpFromLine` | Stands |
| bags | `ShoppingBag` | Bags |
| cables | `Cable` | Cables |
| accessories | `Wrench` | Accessories |

**Type Extension**
```typescript
interface Product {
  // ... existing fields
  compatibility?: ('cases' | 'stands' | 'bags' | 'cables' | 'accessories')[];
}
```

**Compatibility Matching Algorithm**
```
For category "cases":
1. Find all products where `category` = "cases" (or similar case/bag category)
2. Filter to those where product's `compatibility` array includes the current product's category
3. Count = filtered products.length
```

Example:
- Fender Stratocaster has `category: "guitars-basses"` and `compatibility: ['cases', 'stands', 'cables']`
- Case product has `compatibility: ['guitars-basses']` → matches!
- Clicking "Cases" shows cases where `compatibility` includes "guitars-basses"

**URL Parameter Handling** (products/page.tsx)
```typescript
// Read URL params
const searchParams = useSearchParams();
const categoryParam = searchParams.get('category');
const compatibleParam = searchParams.get('compatible');

// If compatible param exists, filter products:
// 1. Find the source product by slug
// 2. Get its category
// 3. Filter products in matching category where compatibility includes source category
```

Note: `useSearchParams()` requires wrapping in Suspense. Add:
```tsx
import { Suspense } from 'react';
// Wrap products page content in <Suspense fallback={...}>
```

### File Changes
- `src/types/product.ts` - Add `compatibility` field to Product interface
- `src/app/products/[slug]/page.tsx` - Add CompatibilityChecker component
- `src/components/product/CompatibilityChecker.tsx` - New component
- `src/data/products.ts` - Add `getProductsByCompatibility()` helper, add compatibility data
- `src/app/products/page.tsx` - Add URL param handling with Suspense wrapper

### CompatibilityChecker Component
```tsx
interface CompatibilityCheckerProps {
  compatibility?: string[];
  productSlug: string;
  productCategory: string;
}

function CompatibilityChecker({ compatibility, productSlug, productCategory }: Props) {
  if (!compatibility?.length) return null;
  
  return (
    <div className="space-y-3">
      <h3 className="font-semibold">Compatible With</h3>
      <div className="flex flex-wrap gap-2">
        {compatibility.map(cat => {
          const count = getCompatibleCount(cat, productCategory);
          return (
            <Link 
              key={cat}
              href={`/products?category=${cat}&compatible=${productSlug}`}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border hover:border-purple-500 transition-colors"
            >
              {getIcon(cat)}
              <span className="text-sm">{getLabel(cat)}</span>
              <span className="text-xs text-muted-foreground">({count})</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
```

### Compatible Badge on Product Cards
When viewing products page with `?compatible` param:
- Show badge in top-right of product card
- Badge text: "Fits this product"
- Style: purple background, white text, small

---

## Data Updates

Add compatibility and specs to products. Products without data show empty section gracefully.

### Fender Stratocaster
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
  }
}
```

### Roland SPD-SX
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
  }
}
```

### Default Behavior
- Products without `specs` field: Specifications tab shows only Features section
- Products without `compatibility`: CompatibilityChecker returns null (renders nothing)

---

## Acceptance Criteria

1. Tabbed interface renders Description and Specifications tabs
2. Description tab shows product description text
3. Specifications tab shows Features as checkmark grid (2 columns)
4. Specifications tab shows Tech Specs in categorized tables (when specs exist)
5. Products without specs show only Features section
6. Compatibility section shows category cards with icons and item counts
7. Clicking category card navigates to `/products?category=X&compatible=Y`
8. Products page shows compatible products when `?compatible` param is present
9. Compatible products show "Fits this product" badge
10. All lint checks pass
