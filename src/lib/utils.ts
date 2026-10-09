import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** The store's fixed conversion rate: every legacy USD catalogue price is ×1500. */
export const NGN_PER_USD = 1500;

/** Converts a USD amount to NGN at `NGN_PER_USD`, rounded to the nearest kobo pair (2 dp). */
export function usdToNgn(usd: number): number {
  return Math.round(usd * NGN_PER_USD * 100) / 100;
}

export function formatPrice(price: number | string, currency: string = "NGN"): string {
  const amount = Number(price);
  // NGN is formatted by hand so the server (Node ICU, which prints "NGN…")
  // and the browser (which prints "₦") cannot serve different strings to the
  // same screen. A hydration mismatch would blink the price twice.
  if (currency === "NGN") {
    return `₦${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

/** Reads a JSON array from localStorage, returning [] on any failure and dropping entries that fail `isValid`. */
export function readStoredArray<T>(key: string, isValid: (value: unknown) => value is T): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValid);
  } catch {
    return [];
  }
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
