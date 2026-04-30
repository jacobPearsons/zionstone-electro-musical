'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Share2, Truck, Shield, RotateCcw, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShippingBadge, DeliveryEstimate, ShippingSelector } from '@/components/shipping';
import { AddToCartButton, WishlistButton, ProductTabs, CompatibilityChecker, DeliveryEstimator } from '@/components/product';
import { getProductBySlug, getRelatedProducts } from '@/data/products';
import { calculateShipping } from '@/lib/shipping';
import { useRecentlyViewed } from '@/lib/recently-viewed-context';
import type { ShippingMethod } from '@/types/shipping';

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedShipping, setSelectedShipping] = useState<ShippingMethod | null>(null);
  const [shippingCalculation, setShippingCalculation] = useState(() => calculateShipping('90210'));
  const [selectedImage, setSelectedImage] = useState(0);
  const [product, setProduct] = useState(getProductBySlug(params.slug));
  const { items: recentlyViewed, addItem } = useRecentlyViewed();

  useEffect(() => {
    const found = getProductBySlug(params.slug);
    setProduct(found);
    setQuantity(1);
    setSelectedImage(0);
  }, [params.slug]);

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
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p className="text-muted-foreground mb-6">The product you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/products">
          <Button>Browse Products</Button>
        </Link>
      </div>
    );
  }

  const relatedProducts = getRelatedProducts(product);
  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : [product.emoji];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Link href="/products" className="inline-flex items-center gap-2 text-muted-foreground hover:text-yellow-600 dark:hover:text-yellow-400 mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Products
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative bg-background dark:bg-gray-900 rounded-2xl border overflow-hidden">
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
                <span className="text-[180px]">{productImages[selectedImage]}</span>
              )}
            </div>
            <div className="absolute top-4 left-4 z-10">
              <ShippingBadge
                shipsInDays={product.shipsInDays}
                twoDayEligible={product.twoDayEligible}
              />
            </div>
            {(product.originalPrice ?? 0) > product.price && (
              <div className="absolute top-4 right-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-lg z-10">
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
                  className={`relative flex-shrink-0 w-20 h-20 rounded-lg border-2 transition-all overflow-hidden ${
                    selectedImage === i 
                      ? 'border-purple-500 ring-2 ring-purple-200 dark:ring-purple-900' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
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
          <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium mb-2">{product.brand}</p>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{product.name}</h1>
          
          {/* Rating */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <span 
                  key={star} 
                  className={`text-lg ${star <= Math.round(product.rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                >
                  ★
                </span>
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {product.rating} ({product.reviews.toLocaleString()} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-4 mb-4">
            <span className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">${product.price}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <>
                <span className="text-xl text-muted-foreground line-through">
                  ${product.originalPrice}
                </span>
                <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-1 rounded text-sm font-medium">
                  Save ${(product.originalPrice - product.price).toFixed(2)}
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
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                  In Stock ({product.inventory} available)
                </span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm text-red-600 dark:text-red-400 font-medium">Out of Stock</span>
              </>
            )}
          </div>

          {/* Shipping Information */}
          <div className="mb-6 p-5 bg-yellow-50 dark:bg-yellow-950 rounded-xl border border-purple-100 dark:border-purple-900">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <h3 className="font-medium">Shipping to 90210</h3>
              </div>
              <button className="text-sm text-yellow-600 dark:text-yellow-400 hover:underline font-medium">Change location</button>
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
            <div className="flex items-center border rounded-lg overflow-hidden bg-background">
              <button 
                className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-lg font-medium"
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
                className="w-16 text-center border-x py-3 font-medium bg-background" 
              />
              <button 
                className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-lg font-medium"
                onClick={() => setQuantity(Math.min(product.inventory || 99, quantity + 1))}
              >
                +
              </button>
            </div>
            
            {/* Add to Cart Button */}
            <AddToCartButton
              product={{
                productId: product.slug,
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
                productId: product.slug,
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
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
            <div className="text-center">
              <Shield className="w-6 h-6 mx-auto text-green-600 dark:text-green-400 mb-1" />
              <p className="text-xs text-muted-foreground">Authentic</p>
            </div>
            <div className="text-center">
              <RotateCcw className="w-6 h-6 mx-auto text-blue-600 dark:text-blue-400 mb-1" />
              <p className="text-xs text-muted-foreground">30-Day Returns</p>
            </div>
            <div className="text-center">
              <Truck className="w-6 h-6 mx-auto text-yellow-600 dark:text-yellow-400 mb-1" />
              <p className="text-xs text-muted-foreground">2-Day Shipping</p>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-6">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <Link
                key={relatedProduct.id}
                href={`/products/${relatedProduct.slug}`}
                className="group bg-background dark:bg-gray-900 rounded-xl border shadow-sm overflow-hidden hover:shadow-lg transition-all"
              >
                <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 relative flex items-center justify-center">
                  <span className="text-5xl">{relatedProduct.emoji}</span>
                  <div className="absolute top-3 left-3">
                    <ShippingBadge
                      shipsInDays={relatedProduct.shipsInDays}
                      twoDayEligible={relatedProduct.twoDayEligible}
                    />
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs text-muted-foreground">{relatedProduct.brand}</p>
                  <h3 className="font-semibold line-clamp-2 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">
                    {relatedProduct.name}
                  </h3>
                  <p className="text-lg font-bold mt-2">${relatedProduct.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recently Viewed Products */}
      {recentlyViewed.length > 1 && (
        <div className="mt-12">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <h2 className="text-xl font-bold">Recently Viewed</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            {recentlyViewed
              .filter(p => p.id !== product.id)
              .slice(0, 6)
              .map((viewedProduct) => (
                <Link
                  key={viewedProduct.id}
                  href={`/products/${viewedProduct.slug}`}
                  className="group bg-background dark:bg-gray-900 rounded-lg border p-3 hover:shadow-md transition-all"
                >
                  <div className="aspect-square bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-2">
                    <span className="text-3xl">{viewedProduct.emoji}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{viewedProduct.brand}</p>
                  <h3 className="text-sm font-medium line-clamp-2 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">
                    {viewedProduct.name}
                  </h3>
                  <p className="text-sm font-bold mt-1">${viewedProduct.price}</p>
                </Link>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
