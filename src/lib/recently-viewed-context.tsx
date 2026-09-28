"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Product } from "@/data/products";
import { readStoredArray } from "@/lib/utils";

interface RecentlyViewedContextType {
  items: Product[];
  addItem: (product: Product) => void;
  clearAll: () => void;
}

const RecentlyViewedContext = createContext<RecentlyViewedContextType | undefined>(undefined);

const MAX_ITEMS = 8;

function isStoredProduct(value: unknown): value is Product {
  if (typeof value !== "object" || value === null) return false;
  return (
    "id" in value && typeof value.id === "string" &&
    "name" in value && typeof value.name === "string" &&
    "brand" in value && typeof value.brand === "string" &&
    "slug" in value && typeof value.slug === "string" &&
    "category" in value && typeof value.category === "string" &&
    "emoji" in value && typeof value.emoji === "string" &&
    "price" in value && typeof value.price === "number" && Number.isFinite(value.price) &&
    "shipsInDays" in value && typeof value.shipsInDays === "number" && Number.isFinite(value.shipsInDays) &&
    "twoDayEligible" in value && typeof value.twoDayEligible === "boolean"
  );
}

export function RecentlyViewedProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(readStoredArray<Product>("recentlyViewed", isStoredProduct).slice(0, MAX_ITEMS));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("recentlyViewed", JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = (product: Product) => {
    setItems((prev) => {
      const filtered = prev.filter((p) => p.id !== product.id);
      const newItems = [product, ...filtered].slice(0, MAX_ITEMS);
      return newItems;
    });
  };

  const clearAll = () => {
    setItems([]);
  };

  return (
    <RecentlyViewedContext.Provider value={{ items, addItem, clearAll }}>
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed() {
  const context = useContext(RecentlyViewedContext);
  if (!context) throw new Error("useRecentlyViewed must be used within RecentlyViewedProvider");
  return context;
}
