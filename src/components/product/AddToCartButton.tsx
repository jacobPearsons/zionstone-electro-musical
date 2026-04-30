'use client';

import { useState } from 'react';
import { ShoppingCart, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart, type CartItem } from '@/lib/cart-context';

interface AddToCartButtonProps {
  product: Omit<CartItem, 'id'>;
  className?: string;
}

export function AddToCartButton({ product, className = '' }: AddToCartButtonProps) {
  const { addItem, items } = useCart();
  const [added, setAdded] = useState(false);
  
  const isInCart = items.some(item => item.productId === product.productId);
  
  const handleAddToCart = () => {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };
  
  if (added || isInCart) {
    return (
      <Button variant="outline" className={`w-full mt-3 ${className}`} disabled>
        <Check className="w-4 h-4 mr-2" />
        Added to Cart
      </Button>
    );
  }
  
  return (
    <Button 
      onClick={handleAddToCart} 
      className={`w-full mt-3 bg-yellow-600 hover:bg-yellow-700 ${className}`}
    >
      <ShoppingCart className="w-4 h-4 mr-2" />
      Add to Cart
    </Button>
  );
}
