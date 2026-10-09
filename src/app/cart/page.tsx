'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import { Trash2, Plus, Minus, ShoppingBag, Truck } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { ShippingCalculator, DeliveryEstimate } from "@/components/shipping";
import { ProductImage } from "@/components/product";
import {
  calculateShipping,
  qualifiesForFreeShipping,
  FREE_SHIPPING_THRESHOLD,
  STANDARD_SHIPPING_FALLBACK,
} from "@/lib/shipping";
import { promoDiscount } from "@/lib/promo-codes";
import { PromoCodeInput } from "@/components/PromoCodeInput";
import type { ShippingMethod } from "@/types/shipping";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, clearCart, promo, setPromo } = useCart();
  const [selectedShipping, setSelectedShipping] = useState<ShippingMethod | null>(null);
  const [estimatedDelivery, setEstimatedDelivery] = useState<string | null>(null);

  // The promo contributes a rate, not an amount: the saving is always derived
  // from the live subtotal, and `promoDiscount` clamps it to the subtotal so a
  // discount can never push the total below zero.
  const discount = promoDiscount(promo, totalPrice);
  // Measured on the subtotal *before* the discount, so applying a promo never
  // takes away free shipping the customer was already promised.
  const freeShipping = qualifiesForFreeShipping(totalPrice);
  const shippingCost = selectedShipping?.price ?? (freeShipping ? 0 : STANDARD_SHIPPING_FALLBACK);
  const finalTotal = Math.max(0, totalPrice - discount + shippingCost);

  const handleShippingCalculate = (method: ShippingMethod, deliveryDate: string) => {
    setSelectedShipping(method);
    setEstimatedDelivery(deliveryDate);
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-semibold tracking-tight mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground mb-6">Add some products to get started!</p>
        <Button asChild>
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <h1 className="text-3xl font-semibold tracking-tight mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex flex-wrap items-start gap-4 rounded-card border border-border bg-card p-4 shadow-card">
              <div className="relative w-24 h-24 flex-shrink-0 bg-muted rounded-card flex items-center justify-center overflow-hidden">
                <ProductImage image={item.image} name={item.name} />
              </div>
              <div className="flex-1 min-w-40">
                {item.slug ? (
                  <Link href={`/products/${item.slug}`} className="inline-flex min-h-11 items-center font-semibold transition-colors duration-200 ease-out hover:text-primary-strong">
                    {item.name}
                  </Link>
                ) : (
                  <span className="font-semibold">{item.name}</span>
                )}
                <p className="text-sm tabular-nums text-muted-foreground mt-1">{formatPrice(item.price, item.currency ?? 'NGN')}</p>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-3">
                  <div className="flex flex-shrink-0 items-center overflow-hidden rounded-card border border-border">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      aria-label={`Decrease quantity of ${item.name}`}
                      className="flex h-11 w-11 flex-shrink-0 items-center justify-center transition-colors duration-200 ease-out hover:bg-muted"
                    >
                      <Minus className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <span className="min-w-10 px-3 text-center tabular-nums">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      aria-label={`Increase quantity of ${item.name}`}
                      className="flex h-11 w-11 flex-shrink-0 items-center justify-center transition-colors duration-200 ease-out hover:bg-muted"
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    aria-label={`Remove ${item.name} from cart`}
                    className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-destructive transition-colors duration-200 ease-out hover:bg-destructive/10"
                  >
                    <Trash2 className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
              </div>
              <div className="ml-auto text-right">
                <p className="font-semibold tabular-nums">{formatPrice(item.price * item.quantity, item.currency ?? 'NGN')}</p>
              </div>
            </div>
          ))}
          <Button variant="outline" onClick={clearCart} className="mt-4 text-destructive hover:text-destructive/80">
            Clear Cart
          </Button>
        </div>

        <div>
          <div className="rounded-card border border-border bg-muted p-6 sticky top-24">
            <h2 className="text-lg font-semibold tracking-tight mb-4">Order Summary</h2>
            
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
              <PromoCodeInput onApply={(applied) => setPromo(applied?.code ?? null)} subtotal={totalPrice} />

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="tabular-nums">{formatPrice(totalPrice)}</span>
              </div>
              {promo && discount > 0 && (
                <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400">
                  <span>Discount ({promo.code}, {promo.percent}%)</span>
                  <span className="tabular-nums">-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="tabular-nums">
                  {selectedShipping
                    ? formatPrice(selectedShipping.price)
                    : (freeShipping ? "Free" : formatPrice(STANDARD_SHIPPING_FALLBACK))
                  }
                </span>
              </div>
              {freeShipping && !selectedShipping && (
                <p className="text-sm text-emerald-600 dark:text-emerald-400">
                  Free shipping applied on orders over {formatPrice(FREE_SHIPPING_THRESHOLD)}
                </p>
              )}
              <div className="border-t border-border pt-3 flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span className="tabular-nums">{formatPrice(finalTotal)}</span>
              </div>
            </div>
            <Button asChild className="w-full" size="lg">
              <Link href="/checkout">Proceed to Checkout</Link>
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-4">
              Free shipping on orders over {formatPrice(FREE_SHIPPING_THRESHOLD)}
            </p>
            <p className="text-xs text-muted-foreground text-center mt-2">Pay securely with Paystack</p>
          </div>
        </div>
      </div>
    </div>
  );
}
