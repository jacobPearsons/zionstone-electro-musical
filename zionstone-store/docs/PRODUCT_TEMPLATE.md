# Product Data Template

## How to Add New Products

Add new products to `/src/data/products.ts` in the `products` array.

## Product Template

```typescript
{
  id: "UNIQUE_ID",           // Must be unique (string)
  name: "Product Name",      // Full product name
  brand: "Brand Name",       // Manufacturer
  price: 999,                // Current price (number)
  originalPrice: 1299,       // Original price before discount (optional)
  category: "category-slug", // See categories below
  slug: "product-slug",      // URL-friendly version (unique)
  emoji: "🎸",               // See emoji guide below
  shipsInDays: 2,            // Days until shipped
  twoDayEligible: true,       // Can use 2-day shipping
  rating: 4.5,               // Average rating (1-5)
  reviews: 123,              // Number of reviews
  description: "...",         // Product description (optional)
  features: [                // Key features (optional)
    "Feature 1",
    "Feature 2",
    "Feature 3"
  ],
  inventory: 10              // Stock quantity (optional)
}
```

## Categories

| Category Slug | Display Name |
|---------------|--------------|
| `guitars-basses` | Guitars & Basses |
| `keyboards-synths` | Keyboards & Synths |
| `recording-gear` | Recording Gear |
| `audio-equipment` | Audio Equipment |
| `drums-percussion` | Drums & Percussion |

## Emoji Icons

| Icon | Use For |
|------|---------|
| 🎸 | Guitars, Electric Guitars |
| 🎹 | Keyboards, Synthesizers, Pianos |
| 🎤 | Microphones, Audio Interfaces |
| 🎙️ | Studio Microphones |
| 🎧 | Headphones, Earbuds |
| 🔊 | Speakers, Monitors |
| 🥁 | Drums, Percussion |
| 🎛️ | DJ Controllers, Mixers |
| 🎵 | General Music Equipment |
| 🎼 | Sheet Music, MIDI |

## Example: Adding a New Guitar

```typescript
{
  id: "13",
  name: "PRS Silver Sky John Mayer",
  brand: "PRS",
  price: 2799,
  originalPrice: 3199,
  category: "guitars-basses",
  slug: "prs-silver-sky",
  emoji: "🎸",
  shipsInDays: 2,
  twoDayEligible: true,
  rating: 4.9,
  reviews: 567,
  description: "The PRS Silver Sky features a maple neck and rosewood fretboard with 25.5\" scale length.",
  features: [
    "Alder body",
    "Maple neck with rosewood fretboard",
    "635JM pickups",
    "Vintage-style tremolo",
    "PRS locking tuners"
  ],
  inventory: 8
}
```

## Example: Adding a Synthesizer

```typescript
{
  id: "14",
  name: "Arturia MiniBrute 2S",
  brand: "Arturia",
  price: 799,
  category: "keyboards-synths",
  slug: "arturia-minibrute-2s",
  emoji: "🎹",
  shipsInDays: 2,
  twoDayEligible: true,
  rating: 4.6,
  reviews: 234,
  description: "Semi-modular analog synthesizer with step sequencer.",
  features: [
    "Analog synthesizer voice",
    "Step sequencer with 64 steps",
    "Modular patchbay",
    " Steiner-Parker filter",
    "Metal keyboard with 37 keys"
  ],
  inventory: 12
}
```

## Tips

1. **Slug** must be unique and URL-safe (use hyphens, not spaces)
2. **Rating** should be between 1-5 with one decimal
3. **Inventory** of 0 or undefined = "Out of Stock"
4. **twoDayEligible: false** = no green badge on product cards
5. **originalPrice** = only set if product is on sale
