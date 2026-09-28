import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Root 404.
 *
 * Reuses the cart empty-state grammar (`src/app/cart/page.tsx:28-37`) — neutral
 * `h-16 w-16` icon, centred stack, one primary pill CTA plus one outline escape —
 * so an unmatched URL reads as the same kind of moment as an empty cart rather than
 * a broken page.
 *
 * "404" is display type, so it takes `text-primary`; per the two-tier accent rule in
 * DESIGN.md, `text-primary-strong` is for body-size text and would be the wrong tier
 * here.
 */
export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <SearchX className="mx-auto mb-6 h-16 w-16 text-muted-foreground" />

      <p className="mb-3 font-display text-6xl font-semibold tracking-tight text-primary md:text-7xl">
        404
      </p>
      <h1 className="mb-2 text-2xl font-semibold tracking-tight">
        This page does not exist
      </h1>
      <p className="mx-auto mb-8 max-w-prose text-muted-foreground">
        The link may be out of date. The whole shop is one click away.
      </p>

      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button asChild>
          <Link href="/products">Browse products</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </div>
  );
}
