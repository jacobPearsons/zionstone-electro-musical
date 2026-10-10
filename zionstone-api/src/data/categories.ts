import { products } from './products.js';

/**
 * The one taxonomy for the whole store.
 *
 * CATEGORIES and BRANDS are derived from `products.ts` at module load, so a
 * count can never drift from the catalogue and a slug can never ship without
 * backing products. The only hand-written part is CATEGORY_META, which supplies
 * the label and description; a slug that appears in the data without meta still
 * ships (with a humanised label) rather than silently disappearing.
 *
 * Ported from the storefront. The storefront's category meta also carried a
 * `lucide-react` icon component for rendering; the API is a headless service
 * with no React dependency, so the icon field is intentionally dropped here.
 */

export interface Category {
  slug: string;
  name: string;
  description: string;
  count: number;
  href: string;
}

export interface Brand {
  name: string;
  count: number;
}

const CATEGORY_META: Record<string, { name: string; description: string }> = {
  'guitars-basses': {
    name: 'Guitars & Basses',
    description: 'Electric, acoustic, and bass guitars',
  },
  'keyboards-synths': {
    name: 'Keyboards & Synths',
    description: 'Analog synths, stage pianos, and workstations',
  },
  'recording-gear': {
    name: 'Recording Gear',
    description: 'Interfaces and studio microphones',
  },
  'audio-equipment': {
    name: 'Audio Equipment',
    description: 'Studio monitors and monitoring headphones',
  },
  'drums-percussion': {
    name: 'Drums & Percussion',
    description: 'Electronic drum kits and sampling percussion',
  },
};

function humanise(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function categoryHref(slug: string): string {
  return `/products?category=${encodeURIComponent(slug)}`;
}

function countWhere(predicate: (category: string) => boolean): number {
  return products.reduce((total, product) => (predicate(product.category) ? total + 1 : total), 0);
}

/** Every category that has at least one product, in first-appearance order. */
export const CATEGORIES: Category[] = products.reduce<Category[]>((accumulator, product) => {
  if (accumulator.some(category => category.slug === product.category)) {
    return accumulator;
  }
  const meta = CATEGORY_META[product.category];
  accumulator.push({
    slug: product.category,
    name: meta?.name ?? humanise(product.category),
    description: meta?.description ?? '',
    count: countWhere(category => category === product.category),
    href: categoryHref(product.category),
  });
  return accumulator;
}, []);

export const CATEGORY_SLUGS: ReadonlySet<string> = new Set(CATEGORIES.map(category => category.slug));

/** Every brand in the catalogue, in first-appearance order, with live counts. */
export const BRANDS: Brand[] = products.reduce<Brand[]>((accumulator, product) => {
  const existing = accumulator.find(brand => brand.name === product.brand);
  if (existing) {
    existing.count += 1;
  } else {
    accumulator.push({ name: product.brand, count: 1 });
  }
  return accumulator;
}, []);

/** Slug to label. Falls back to a humanised slug so unknown values still read. */
export function categoryDisplayName(slug: string): string {
  return CATEGORIES.find(category => category.slug === slug)?.name ?? humanise(slug);
}

/** Brands stocked in a category, most stocked first. */
export function brandsInCategory(slug: string): Brand[] {
  return BRANDS.filter(brand => products.some(p => p.category === slug && p.brand === brand.name)).sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name)
  );
}
