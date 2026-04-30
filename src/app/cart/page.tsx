'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import { Trash2, Plus, Minus, ShoppingBag, Truck } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { ShippingCalculator, DeliveryEstimate } from "@/components/shipping";
import { calculateShipping } from "@/lib/shipping";
import { PromoCodeInput } from "@/components/PromoCodeInput";
import type { ShippingMethod } from "@/types/shipping";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();
  const [selectedShipping, setSelectedShipping] = useState<ShippingMethod | null>(null);
  const [estimatedDelivery, setEstimatedDelivery] = useState<Date | null>(null);
  const [discount, setDiscount] = useState(0);
  
  const shippingCost = selectedShipping?.price || (totalPrice >= 99 ? 0 : 9.99);
  const finalTotal = totalPrice - discount + shippingCost;

  const handleShippingCalculate = (method: ShippingMethod, deliveryDate: Date) => {
    setSelectedShipping(method);
    setEstimatedDelivery(deliveryDate);
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground mb-6">Add some products to get started!</p>
        <Link href="/products">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
              <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-4xl">{item.image}</span>
              </div>
              <div className="flex-1">
                <Link href={`/products/${item.productId}`} className="font-semibold hover:text-primary">
                  {item.name}
                </Link>
                <p className="text-muted-foreground text-sm mt-1">{formatPrice(item.price)}</p>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center border rounded-md">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-2 hover:bg-gray-100"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-3">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-2 hover:bg-gray-100"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-destructive hover:text-destructive/80"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
              </div>
            </div>
          ))}
          <Button variant="outline" onClick={clearCart} className="mt-4">
            Clear Cart
          </Button>
        </div>

        <div>
          <div className="border rounded-lg p-6 sticky top-24">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            
            {/* Shipping Calculator */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Shipping</span>
              </div>
              <ShippingCalculator onCalculate={handleShippingCalculate} />
              
              {estimatedDelivery && selectedShipping && (
                <DeliveryEstimate
                  estimatedDelivery={estimatedDelivery}
                  shippingMethodName={selectedShipping.name}
                  className="mt-4"
                />
              )}
            </div>
            
            <div className="space-y-3 mb-6">
              <PromoCodeInput onApply={setDiscount} />
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>
                  {selectedShipping 
                    ? formatPrice(selectedShipping.price)
                    : (totalPrice >= 99 ? "Free" : formatPrice(9.99))
                  }
                </span>
              </div>
              {totalPrice >= 99 && !selectedShipping && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Free Shipping Applied</span>
                  <span>-{formatPrice(9.99)}</span>
                </div>
              )}
              <div className="border-t pt-3 flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatPrice(finalTotal)}</span>
              </div>
            </div>
            <Link href="/checkout">
              <Button className="w-full" size="lg">Proceed to Checkout</Button>
            </Link>
            <p className="text-xs text-muted-foreground text-center mt-4">
              Free shipping on orders over $99
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
