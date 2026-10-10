"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { readStoredArray } from "@/lib/utils";
import { findPromoCode, type PromoCode } from "@/lib/promo-codes";

export interface CartItem {
  id: string;
  /** Product identity: `Product.id`, never the slug — `slug` is only for building links. */
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  slug?: string;
  brand?: string;
  /** Matches the product's `currency` so line items price in the currency offered. */
  currency?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  /** The promo code in force, `null` when none. Shared so cart, checkout, and
   *  payment see the same discount instead of each holding local state. */
  promo: PromoCode | null;
  /** Canonical valid code string, for the server to re-validate at charge time. */
  promoCode?: string;
  /** Applies or clears a code; invalid input stores nothing. */
  setPromo: (code: string | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== "object" || value === null) return false;
  return (
    "id" in value && typeof value.id === "string" &&
    "productId" in value && typeof value.productId === "string" &&
    "name" in value && typeof value.name === "string" &&
    "image" in value && typeof value.image === "string" &&
    "price" in value && typeof value.price === "number" && Number.isFinite(value.price) &&
    "quantity" in value && typeof value.quantity === "number" && Number.isFinite(value.quantity) &&
    (!("slug" in value) || value.slug === undefined || typeof value.slug === "string") &&
    (!("brand" in value) || value.brand === undefined || typeof value.brand === "string") &&
    (!("currency" in value) || value.currency === undefined || typeof value.currency === "string")
  );
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [promoCode, setPromoCode] = useState<string | null>(null);

  useEffect(() => {
    setItems(readStoredArray<CartItem>("cart", isCartItem));
    const stored = localStorage.getItem("promo_code");
    setPromoCode(stored ? findPromoCode(stored)?.code ?? null : null);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (promoCode) {
      localStorage.setItem("promo_code", promoCode);
    } else {
      localStorage.removeItem("promo_code");
    }
  }, [promoCode, hydrated]);

  const addItem = (item: Omit<CartItem, "id">) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      return [...prev, { ...item, id: `${item.productId}-${Date.now()}` }];
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)));
  };

  const clearCart = () => setItems([]);

  // Only a valid, known code is kept — a mistyped input clears rather than
  // persisting something the server would reject at charge time.
  const promo = promoCode ? findPromoCode(promoCode) : null;
  const setPromo = (code: string | null) => {
    setPromoCode(code ? findPromoCode(code)?.code ?? null : null);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        promo,
        promoCode: promo?.code,
        setPromo,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
