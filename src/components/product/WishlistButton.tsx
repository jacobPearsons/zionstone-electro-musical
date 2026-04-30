'use client';

import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWishlist, type WishlistItem } from '@/lib/wishlist-context';

interface WishlistButtonProps {
  product: Omit<WishlistItem, 'id'>;
  className?: string;
  variant?: 'default' | 'ghost' | 'outline';
}

export function WishlistButton({ product, className = '', variant = 'ghost' }: WishlistButtonProps) {
  const { isInWishlist, toggleItem } = useWishlist();
  
  const inWishlist = isInWishlist(product.productId);
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(product);
  };
  
  if (variant === 'ghost') {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClick}
        className={`absolute top-3 right-3 z-10 ${className}`}
      >
        <Heart 
          className={`h-5 w-5 transition-colors ${inWishlist ? 'fill-pink-500 text-pink-500' : 'text-gray-500'}`} 
        />
      </Button>
    );
  }
  
  return (
    <Button
      variant={inWishlist ? 'default' : 'outline'}
      onClick={handleClick}
      className={`gap-2 ${className}`}
    >
      <Heart className={`h-4 w-4 ${inWishlist ? 'fill-current' : ''}`} />
      {inWishlist ? 'In Wishlist' : 'Add to Wishlist'}
    </Button>
  );
}
