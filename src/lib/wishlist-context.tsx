"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { readStoredArray } from "@/lib/utils";

export interface WishlistItem {
  id: string;
  /** Product identity: `Product.id`, never the slug — `slug` is only for building links. */
  productId: string;
  name: string;
  price: number;
  image: string;
  brand?: string;
  slug?: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  addItem: (item: Omit<WishlistItem, "id">) => void;
  removeItem: (id: string) => void;
  isInWishlist: (productId: string) => boolean;
  toggleItem: (item: Omit<WishlistItem, "id">) => void;
  totalItems: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

function isWishlistItem(value: unknown): value is WishlistItem {
  if (typeof value !== "object" || value === null) return false;
  return (
    "id" in value && typeof value.id === "string" &&
    "productId" in value && typeof value.productId === "string" &&
    "name" in value && typeof value.name === "string" &&
    "image" in value && typeof value.image === "string" &&
    "price" in value && typeof value.price === "number" && Number.isFinite(value.price) &&
    (!("slug" in value) || value.slug === undefined || typeof value.slug === "string") &&
    (!("brand" in value) || value.brand === undefined || typeof value.brand === "string")
  );
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(readStoredArray<WishlistItem>("wishlist", isWishlistItem));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("wishlist", JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = (item: Omit<WishlistItem, "id">) => {
    setItems((prev) => {
      if (prev.some((i) => i.productId === item.productId)) {
        return prev;
      }
      return [...prev, { ...item, id: `${item.productId}-${Date.now()}` }];
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const isInWishlist = (productId: string) => {
    return items.some((i) => i.productId === productId);
  };

  const toggleItem = (item: Omit<WishlistItem, "id">) => {
    if (isInWishlist(item.productId)) {
      const existingItem = items.find((i) => i.productId === item.productId);
      if (existingItem) {
        removeItem(existingItem.id);
      }
    } else {
      addItem(item);
    }
  };

  const totalItems = items.length;

  return (
    <WishlistContext.Provider value={{ items, addItem, removeItem, isInWishlist, toggleItem, totalItems }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within WishlistProvider");
  return context;
}
