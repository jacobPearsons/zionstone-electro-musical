'use client';

import { Suspense, useState, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, SlidersHorizontal, Grid3X3, LayoutList, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShippingBadge } from '@/components/shipping';
import { AddToCartButton, ProductImage, ContactOwnerButton } from '@/components/product';
import { products, isOnSale, discountPercent } from '@/data/products';
import { BRANDS, CATEGORIES, CATEGORY_SLUGS, categoryDisplayName } from '@/data/categories';
import { formatPrice } from '@/lib/utils';

const priceRanges = [
  { label: "Under $100", min: 0, max: 100 },
  { label: "$100 - $300", min: 100, max: 300 },
  { label: "$300 - $500", min: 300, max: 500 },
  { label: "$500 - $1000", min: 500, max: 1000 },
  { label: "Over $1000", min: 1000, max: Infinity },
];

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const compatibleSlug = searchParams.get('compatible');
  const saleOnly = searchParams.get('sale') === 'true';

  const categoryParam = searchParams.get('category');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    categoryParam && CATEGORY_SLUGS.has(categoryParam) ? categoryParam : null
  );
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<typeof priceRanges[0] | null>(null);
  const [twoDayOnly, setTwoDayOnly] = useState(false);
  const [sortBy, setSortBy] = useState('default');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // `sale` lives in the URL rather than component state so the filter survives a
  // refresh, is shareable, and is visible in the address bar.
  function replaceQuery(next: URLSearchParams) {
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function setSaleOnly(on: boolean) {
    const next = new URLSearchParams(searchParams.toString());
    if (on) {
      next.set('sale', 'true');
    } else {
      next.delete('sale');
    }
    replaceQuery(next);
  }

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
        p.price != null && p.price >= selectedPriceRange.min && p.price < selectedPriceRange.max
      );
    }

    if (twoDayOnly) {
      result = result.filter(p => p.twoDayEligible);
    }

    if (saleOnly) {
      result = result.filter(isOnSale);
    }

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
        result.sort((a, b) => (a.price ?? -Infinity) - (b.price ?? -Infinity));
        break;
      case 'price-high':
        result.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
        break;
      case 'rating':
        result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
    }

    return result;
  }, [searchQuery, selectedCategory, selectedBrands, selectedPriceRange, twoDayOnly, saleOnly, sortBy, compatibleSlug]);

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedBrands([]);
    setSelectedPriceRange(null);
    setTwoDayOnly(false);
    if (saleOnly) {
      setSaleOnly(false);
    }
  };

  const hasActiveFilters = Boolean(
    selectedCategory || selectedBrands.length > 0 || selectedPriceRange || twoDayOnly || saleOnly
  );

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{saleOnly ? 'Sale' : 'Products'}</h1>
          <p className="text-muted-foreground">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
            {selectedCategory && ` in ${categoryDisplayName(selectedCategory)}`}
            {saleOnly && ' on sale'}
          </p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <div className="hidden md:flex items-center gap-2 border border-border rounded-xl p-1 bg-background">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors duration-200 ease-out ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors duration-200 ease-out ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
            >
              <LayoutList className="w-4 h-4" />
            </button>
          </div>

          <select 
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="default">Default Sort</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Mobile Filter Toggle */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="md:hidden w-full mb-4 flex items-center justify-center gap-2 py-3 rounded-card border border-border bg-card transition-colors duration-200 ease-out hover:bg-muted"
      >
        <SlidersHorizontal className="w-4 h-4" />
        <span>Filters</span>
        {hasActiveFilters && (
          <span className="w-2 h-2 bg-primary rounded-full" />
        )}
      </button>

      <div className="flex gap-8">
        {/* Filters Sidebar */}
        <aside className={`w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden'} md:block`}>
          <div className="sticky top-4 space-y-6 rounded-card border border-border bg-card p-4">
            {/* 2-Day Shipping Filter */}
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Quick Filters</h3>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-xs font-medium text-primary-strong underline-offset-4 transition-colors duration-200 ease-out hover:text-primary-strong/80 hover:underline">
                  Clear all
                </button>
              )}
            </div>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={saleOnly}
                onChange={(e) => setSaleOnly(e.target.checked)}
                className="w-4 h-4 rounded border-input accent-primary focus:ring-primary"
              />
              <span className="text-sm font-medium">On sale</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={twoDayOnly}
                onChange={(e) => setTwoDayOnly(e.target.checked)}
                className="w-4 h-4 rounded border-input accent-primary focus:ring-primary"
              />
              <span className="text-sm font-medium flex items-center gap-2">
                <ShippingBadge shipsInDays={2} twoDayEligible={true} />
              </span>
            </label>

            {/* Categories */}
            <div>
              <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">Categories</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors duration-200 ease-out flex items-center justify-between ${
                    !selectedCategory ? 'bg-primary/10 text-primary-strong font-medium' : 'hover:bg-muted'
                  }`}
                >
                  <span>All Products</span>
                  <span className="text-muted-foreground tabular-nums">{products.length}</span>
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.slug}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors duration-200 ease-out flex items-center justify-between ${
                      selectedCategory === cat.slug ? 'bg-primary/10 text-primary-strong font-medium' : 'hover:bg-muted'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-muted-foreground tabular-nums">{cat.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">Price Range</h3>
              <div className="space-y-2">
                {priceRanges.map((range) => (
                  <button
                    key={range.label}
                    onClick={() => setSelectedPriceRange(selectedPriceRange?.label === range.label ? null : range)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors duration-200 ease-out ${
                      selectedPriceRange?.label === range.label ? 'bg-primary/10 text-primary-strong font-medium' : 'hover:bg-muted'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Brands */}
            <div>
              <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">Brands</h3>
              <div className="space-y-2">
                {BRANDS.map((brand) => (
                  <label key={brand.name} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand.name)}
                      onChange={() => toggleBrand(brand.name)}
                      className="w-4 h-4 rounded border-input accent-primary focus:ring-primary"
                    />
                    <span className="text-sm flex-1">{brand.name}</span>
                    <span className="text-xs tabular-nums text-muted-foreground">{brand.count}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mb-6">
              {saleOnly && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary-strong rounded-full text-sm">
                  On sale
                  <button
                    onClick={() => setSaleOnly(false)}
                    aria-label="Clear the sale filter"
                    className="rounded-full focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedCategory && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary-strong rounded-full text-sm">
                  {categoryDisplayName(selectedCategory)}
                  <button
                    onClick={() => setSelectedCategory(null)}
                    aria-label={`Clear the ${categoryDisplayName(selectedCategory)} filter`}
                    className="rounded-full focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedBrands.map(brand => (
                <span key={brand} className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary-strong rounded-full text-sm">
                  {brand}
                  <button
                    onClick={() => toggleBrand(brand)}
                    aria-label={`Clear the ${brand} filter`}
                    className="rounded-full focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {selectedPriceRange && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary-strong rounded-full text-sm">
                  {selectedPriceRange.label}
                  <button
                    onClick={() => setSelectedPriceRange(null)}
                    aria-label={`Clear the ${selectedPriceRange.label} filter`}
                    className="rounded-full focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {twoDayOnly && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-sm">
                  2-Day Shipping
                  <button
                    onClick={() => setTwoDayOnly(false)}
                    aria-label="Clear the 2-day shipping filter"
                    className="rounded-full focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}

          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground mb-4">
                {saleOnly
                  ? 'Nothing is on sale under these other filters'
                  : 'No products found matching your criteria'}
              </p>
              <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
            }>
              {filteredProducts.map((product) => (
                // One gold element per card: the price. The rating star is a
                // bullet, not a signal, and the compatibility badge above is
                // neutral — a gold fill on every card in the grid is a
                // background, not an accent (spec §1, §3.5, §3.6).
                <div
                  key={product.id}
                  className={`group overflow-hidden rounded-card border border-border bg-card text-card-foreground shadow-card transition-shadow duration-200 ease-out hover:shadow-card-hover ${
                    viewMode === 'list' ? 'flex' : ''
                  }`}
                >
                  <Link href={`/products/${product.slug}`} className={viewMode === 'list' ? 'flex' : 'block'}>
                    <div className={`relative flex items-center justify-center bg-muted ${
                      viewMode === 'grid' ? 'aspect-square' : 'w-48 h-48 flex-shrink-0'
                    }`}>
                      <ProductImage image={product.images?.[0] ?? product.emoji ?? ''} name={product.name} />
                      <div className="absolute top-3 left-3">
                        <ShippingBadge
                          shipsInDays={product.shipsInDays}
                          twoDayEligible={product.twoDayEligible}
                        />
                      </div>
                      {isOnSale(product) && (
                        <div className="absolute top-3 right-3 rounded-full bg-destructive px-2 py-1 text-xs font-semibold text-destructive-foreground">
                          {discountPercent(product)}% OFF
                        </div>
                      )}
                      {compatibleSlug && (
                        <div className="absolute top-3 right-3 rounded-full bg-card/90 border border-border px-2 py-1 text-xs">
                          Fits this product
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="p-4 flex-1 flex flex-col">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{product.brand}</p>
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="mt-1 line-clamp-2 font-semibold tracking-tight transition-colors duration-200 ease-out group-hover:text-primary-strong">
                        {product.name}
                      </h3>
                    </Link>
                    {product.rating != null && (
                      <div className="flex items-center gap-1 mt-2">
                        <span className="text-muted-foreground">★</span>
                        <span className="text-sm tabular-nums">{product.rating}</span>
                        <span className="text-xs text-muted-foreground">({product.reviews ?? 0})</span>
                      </div>
                    )}
                    {product.price != null ? (
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-lg font-semibold tabular-nums text-primary-strong">{formatPrice(product.price, product.currency ?? 'USD')}</span>
                        {isOnSale(product) && (
                          <span className="text-sm tabular-nums text-muted-foreground line-through">
                            {formatPrice(product.originalPrice as number, product.currency ?? 'USD')}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-lg font-semibold tabular-nums text-primary-strong">Price on Request</span>
                      </div>
                    )}
                    <div className="mt-auto pt-3">
                      {product.price != null ? (
                        <AddToCartButton
                          product={{
                            productId: product.id,
                            name: product.name,
                            price: product.price,
                            image: product.images?.[0] ?? product.emoji ?? '',
                            quantity: 1,
                            slug: product.slug,
                            brand: product.brand,
                            currency: product.currency,
                          }}
                        />
                      ) : (
                        <ContactOwnerButton productName={product.name} productSlug={product.slug} />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-12 md:py-16">Loading...</div>}>
      <ProductsPageContent />
    </Suspense>
  );
}
