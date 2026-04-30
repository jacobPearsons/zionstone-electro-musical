import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Heart, Eye, Star, Package } from 'lucide-react';
import { ShippingBadge } from '@/components/shipping/ShippingBadge';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/cart-context';
import { useWishlist } from '@/lib/wishlist-context';
import type { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
  showQuickActions?: boolean;
}

export function ProductCard({ product, showQuickActions = true }: ProductCardProps) {
  const { addItem } = useCart();
  const { isInWishlist, toggleItem } = useWishlist();
  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0]?.url || '📦',
      quantity: 1,
      slug: product.slug,
      brand: product.brandId || '',
    });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0]?.url || '📦',
      brand: product.brandId || '',
      slug: product.slug,
    });
  };

  const primaryImage = product.images?.[0];
  const discount = product.comparePrice && product.comparePrice > product.price
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : 0;

  const avgRating = product.reviews?.length 
    ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length 
    : 0;

  return (
    <div className="group relative rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden hover:shadow-lg transition-all">
      <Link href={`/products/${product.slug}`}>
        <div className="aspect-square relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt || product.name}
              fill
              className="object-cover"
            />
          ) : (
            <Package className="w-24 h-24 text-gray-300 dark:text-gray-600" />
          )}
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {product.shippingInfo?.eligibleForTwoDay && (
              <ShippingBadge
                shipsInDays={product.shippingInfo.shipsInDays}
                twoDayEligible={product.shippingInfo.eligibleForTwoDay}
              />
            )}
          </div>
          
          {/* Sale badge */}
          {discount > 0 && (
            <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              {discount}% OFF
            </div>
          )}
          
          {/* Quick Actions - appear on hover */}
          {showQuickActions && (
            <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 duration-200">
              <Button
                size="sm"
                className="flex-1 bg-white dark:bg-gray-800 text-yellow-900 dark:text-yellow-100 hover:bg-yellow-900 hover:text-white dark:hover:bg-yellow-600 dark:hover:text-white border-0"
                onClick={handleAddToCart}
                disabled={product.inventory === 0}
              >
                <ShoppingCart className="w-4 h-4 mr-1" />
                Add
              </Button>
              <Button
                size="sm"
                variant={inWishlist ? 'default' : 'outline'}
                className={inWishlist ? 'bg-pink-500 hover:bg-pink-600 border-0' : 'bg-white dark:bg-gray-800'}
                onClick={handleWishlist}
              >
                <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
              </Button>
              <Link href={`/products/${product.slug}`}>
                <Button size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                  <Eye className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-4">
        {product.brandId && (
          <p className="text-xs text-muted-foreground">{product.brandId}</p>
        )}
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold mt-1 line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        
        {/* Rating */}
        {avgRating > 0 && (
          <div className="flex items-center gap-1 mt-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3 h-3 ${
                    star <= Math.round(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            {product.reviews?.length && (
              <span className="text-xs text-muted-foreground">({product.reviews.length})</span>
            )}
          </div>
        )}
        
        {/* Price */}
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-sm text-muted-foreground line-through">
              ${product.comparePrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Stock status */}
        <div className="flex items-center gap-2 mt-2">
          {product.inventory > 0 ? (
            <span className="text-xs text-green-600 dark:text-green-400">In Stock</span>
          ) : (
            <span className="text-xs text-red-600 dark:text-red-400">Out of Stock</span>
          )}
        </div>
      </div>
    </div>
  );
}