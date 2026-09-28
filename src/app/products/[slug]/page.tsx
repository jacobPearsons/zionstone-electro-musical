'use client';

import { use, useState, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Share2, Truck, Shield, RotateCcw, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShippingBadge, DeliveryEstimate, ShippingSelector } from '@/components/shipping';
import { AddToCartButton, WishlistButton, ProductTabs, CompatibilityChecker, DeliveryEstimator } from '@/components/product';
import { getProductBySlug, getRelatedProducts } from '@/data/products';
import { calculateShipping, getShippingBadgeText } from '@/lib/shipping';
import { formatPrice } from '@/lib/utils';
import { useRecentlyViewed } from '@/lib/recently-viewed-context';
import type { ShippingMethod } from '@/types/shipping';

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [quantity, setQuantity] = useState(1);
  const [selectedShipping, setSelectedShipping] = useState<ShippingMethod | null>(null);
  const [shippingCalculation, setShippingCalculation] = useState(() => calculateShipping('90210'));
  const [selectedImage, setSelectedImage] = useState(0);
  const [product, setProduct] = useState(() => getProductBySlug(slug));
  const { items: recentlyViewed, addItem } = useRecentlyViewed();

  useEffect(() => {
    const found = getProductBySlug(slug);
    setProduct(found);
    setQuantity(1);
    setSelectedImage(0);
  }, [slug]);

  useEffect(() => {
    if (product) {
      addItem(product);
    }
  }, [product, addItem]);

  const handleShippingChange = (method: ShippingMethod) => {
    setSelectedShipping(method);
  };

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center md:py-24">
        <h1 className="mb-4 text-2xl font-semibold tracking-tight">Product Not Found</h1>
        <p className="text-muted-foreground mb-6">The product you&apos;re looking for doesn&apos;t exist.</p>
        <Button asChild>
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  const relatedProducts = getRelatedProducts(product);
  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : [product.emoji];

  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      {/* Breadcrumb */}
      <Link href="/products" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground underline-offset-4 transition-colors duration-200 ease-out hover:text-primary-strong">
        <ArrowLeft className="h-4 w-4" />
        Back to Products
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-card border border-border bg-muted">
            <div className="aspect-square flex items-center justify-center">
              {productImages[selectedImage]?.startsWith('/') ? (
                <Image
                  src={productImages[selectedImage]}
                  alt={product.name}
                  width={600}
                  height={600}
                  className="object-contain max-h-[500px]"
                  priority
                />
              ) : (
                <span className="text-4xl">{productImages[selectedImage]}</span>
              )}
            </div>
            <div className="absolute top-4 left-4 z-10">
              <ShippingBadge
                shipsInDays={product.shipsInDays}
                twoDayEligible={product.twoDayEligible}
              />
            </div>
            {(product.originalPrice ?? 0) > product.price && (
              <div className="absolute top-4 right-4 z-10 rounded-full bg-destructive px-3 py-1 text-sm font-semibold text-destructive-foreground">
                {Math.round((1 - product.price / (product.originalPrice ?? product.price)) * 100)}% OFF
              </div>
            )}
          </div>
          
          {/* Thumbnail gallery */}
          {productImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {productImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative flex-shrink-0 w-20 h-20 overflow-hidden rounded-card border-2 transition-colors duration-200 ease-out ${
                    selectedImage === i 
                      ? 'border-primary ring-2 ring-primary/20' 
                      : 'border-border hover:border-primary/40'
                  }`}
                >
                  {img?.startsWith('/') ? (
                    <Image
                      src={img}
                      alt={`${product.name} view ${i + 1}`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-2xl flex items-center justify-center h-full">{img}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">{product.brand}</p>
          <h1 className="mb-4 text-4xl font-semibold tracking-tight md:text-5xl">{product.name}</h1>
          
          {/* Rating. The loop stays inline: it is two lines of arithmetic and a
              glyph, and a `StarRating` component for one call site would be
              ceremony (spec §3.7 / §8.4, decision recorded there). Two things it
              must get right, and one of them it did not:
              - `star <= Math.round(product.rating)` rounded every rating in the
                catalogue up to 5, so a 4.6 rendered as five filled stars — the
                distinction was computed and then thrown away. `rating >= star`
                fills the threshold instead, so 4.6 shows four and 4.9 shows five.
              - The empty star is `☆`, not a dimmer `★`, so the difference
                survives greyscale, high contrast and colour-vision deficiency
                (WCAG 1.4.1). Opacity alone was the only signal.
              The row is `aria-hidden` because the number beside it is the value;
              a screen reader should hear "4.8 (2,173 reviews)", not five stars. */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1" aria-hidden="true">
              {[1, 2, 3, 4, 5].map((star) => {
                const filled = star <= product.rating;
                return (
                  <span
                    key={star}
                    className={`text-lg ${filled ? 'text-foreground' : 'text-muted-foreground/40'}`}
                  >
                    {filled ? '★' : '☆'}
                  </span>
                );
              })}
            </div>
            <span className="text-sm text-muted-foreground">
              {product.rating} ({product.reviews.toLocaleString()} reviews)
            </span>
          </div>

          {/* Price — the single gold moment in the buy column. 30px semibold
              clears the >=24px / >=18.66px-bold bar, so `text-primary` is legal
              here; everything else in the column stays on neutral or muted. */}
          <div className="flex items-baseline gap-4 mb-4">
            <span className="text-3xl font-semibold tabular-nums tracking-tight text-primary">{formatPrice(product.price)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <>
                <span className="text-xl tabular-nums text-muted-foreground line-through">
                  {formatPrice(product.originalPrice)}
                </span>
                <span className="rounded-full bg-destructive/10 px-2 py-1 text-sm font-medium text-destructive">
                  Save {formatPrice(product.originalPrice - product.price)}
                </span>
              </>
            )}
          </div>

          {/* Delivery Estimator - Quick Check */}
          <div className="mb-6">
            <DeliveryEstimator productId={product.slug} />
          </div>

          {/* Tabbed Content */}
          <div className="mb-6">
            <ProductTabs
              description={product.description}
              specs={product.specs}
              features={product.features}
            />
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2 mb-6">
            {product.inventory && product.inventory > 0 ? (
              <>
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  In Stock ({product.inventory} available)
                </span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-destructive rounded-full"></div>
                <span className="text-sm font-medium text-destructive">Out of Stock</span>
              </>
            )}
          </div>

          {/* Shipping Information */}
          <div className="mb-6 rounded-card border border-border bg-muted p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-semibold tracking-tight">Shipping to 90210</h3>
              </div>
              <button className="text-sm font-medium text-primary-strong underline-offset-4 transition-colors duration-200 ease-out hover:text-primary-strong/80 hover:underline">Change location</button>
            </div>
            
            {selectedShipping && shippingCalculation.estimatedDeliveryDates[selectedShipping.id] && (
              <DeliveryEstimate
                estimatedDelivery={shippingCalculation.estimatedDeliveryDates[selectedShipping.id]}
                shippingMethodName={selectedShipping.name}
                className="mb-4"
              />
            )}
            
            <ShippingSelector
              methods={shippingCalculation.methods}
              estimatedDeliveryDates={shippingCalculation.estimatedDeliveryDates}
              selectedMethodId={selectedShipping?.id || ''}
              onSelect={handleShippingChange}
            />
          </div>

          {/* Add to Cart / Wishlist */}
          <div className="flex items-center gap-4 mb-6">
            {/* Quantity Selector */}
            <div className="flex items-center overflow-hidden rounded-card border border-border bg-background">
              <button 
                className="px-4 py-3 text-lg font-medium transition-colors duration-200 ease-out hover:bg-muted"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                −
              </button>
              <input 
                type="number" 
                value={quantity} 
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                min={1} 
                max={product.inventory || 99}
                className="w-16 border-x border-border py-3 text-center font-medium tabular-nums bg-background" 
              />
              <button 
                className="px-4 py-3 text-lg font-medium transition-colors duration-200 ease-out hover:bg-muted"
                onClick={() => setQuantity(Math.min(product.inventory || 99, quantity + 1))}
              >
                +
              </button>
            </div>
            
            {/* Add to Cart Button */}
            <AddToCartButton
              product={{
                productId: product.id,
                name: product.name,
                price: product.price,
                image: product.emoji,
                quantity: quantity,
                slug: product.slug,
                brand: product.brand,
              }}
              className="flex-1"
            />
          </div>

          {/* Wishlist & Share */}
          <div className="flex gap-3 mb-8">
            <WishlistButton
              product={{
                productId: product.id,
                name: product.name,
                price: product.price,
                image: product.emoji,
                slug: product.slug,
                brand: product.brand,
              }}
              className="flex-1"
              variant="outline"
            />
            <Button variant="outline" size="icon" className="px-3">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Compatibility Checker */}
          <div className="mb-6">
            <CompatibilityChecker
              compatibility={product.compatibility}
              productSlug={product.slug}
              productCategory={product.category}
            />
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 divide-x divide-border border-y border-border py-5">
            <div className="text-center">
              <Shield className="mb-1 mx-auto h-6 w-6 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Authentic</p>
            </div>
            <div className="text-center">
              <RotateCcw className="mb-1 mx-auto h-6 w-6 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">30-Day Returns</p>
            </div>
            <div className="text-center">
              <Truck className="mb-1 mx-auto h-6 w-6 text-muted-foreground" />
              {/* This badge used to read a flat "2-Day Shipping", but only 2 of 14
                  products are two-day eligible and delivery also depends on the
                  destination zone. It now states this product's real dispatch time
                  via the same helper the rest of the store uses. */}
              <p className="text-xs text-muted-foreground">
                {getShippingBadgeText(product.shipsInDays, product.twoDayEligible)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16 md:mt-24">
          <h2 className="mb-6 text-2xl font-semibold tracking-tight md:text-3xl">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <Link
                key={relatedProduct.id}
                href={`/products/${relatedProduct.slug}`}
                className="group overflow-hidden rounded-card border border-border bg-card shadow-card transition-shadow duration-200 ease-out hover:shadow-card-hover"
              >
                <div className="relative flex aspect-square items-center justify-center bg-muted">
                  <span className="text-4xl">{relatedProduct.emoji}</span>
                  <div className="absolute top-3 left-3">
                    <ShippingBadge
                      shipsInDays={relatedProduct.shipsInDays}
                      twoDayEligible={relatedProduct.twoDayEligible}
                    />
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{relatedProduct.brand}</p>
                  <h3 className="line-clamp-2 font-semibold tracking-tight transition-colors duration-200 ease-out group-hover:text-primary-strong">
                    {relatedProduct.name}
                  </h3>
                  <p className="mt-2 text-lg font-semibold tabular-nums text-primary-strong">{formatPrice(relatedProduct.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recently Viewed Products */}
      {recentlyViewed.length > 1 && (
        <div className="mt-16 md:mt-24">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Recently Viewed</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            {recentlyViewed
              .filter(p => p.id !== product.id)
              .slice(0, 6)
              .map((viewedProduct) => (
                <Link
                  key={viewedProduct.id}
                  href={`/products/${viewedProduct.slug}`}
                  className="group rounded-card border border-border bg-card p-3 shadow-card transition-shadow duration-200 ease-out hover:shadow-card-hover"
                >
                  <div className="mb-2 flex aspect-square items-center justify-center rounded-lg bg-muted">
                    <span className="text-4xl">{viewedProduct.emoji}</span>
                  </div>
                  <p className="truncate text-xs font-medium uppercase tracking-wider text-muted-foreground">{viewedProduct.brand}</p>
                  <h3 className="line-clamp-2 text-sm font-medium transition-colors duration-200 ease-out group-hover:text-primary-strong">
                    {viewedProduct.name}
                  </h3>
                  <p className="mt-1 text-sm font-semibold tabular-nums text-primary-strong">{formatPrice(viewedProduct.price)}</p>
                </Link>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
