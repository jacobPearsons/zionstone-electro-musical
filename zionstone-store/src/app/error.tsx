'use client';

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Route-level error boundary.
 *
 * Names the thing that failed in plain language and offers a real retry. The error
 * itself — message, stack, digest — is logged to the console for debugging and is
 * deliberately never rendered: in development `error.message` is the raw thrown
 * value, which is not something to put in front of a shopper.
 *
 * Layout follows the cart empty-state grammar (`src/app/cart/page.tsx:28-38`).
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // The only place the real error survives. Nothing below is derived from it.
    console.error(error);
  }, [error]);

  return (
    <div
      role="alert"
      className="container mx-auto px-4 py-16 text-center"
    >
      <TriangleAlert className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
      <h1 className="mb-2 text-2xl font-semibold tracking-tight">
        This page failed to load
      </h1>
      <p className="mx-auto mb-6 max-w-prose text-muted-foreground">
        Something went wrong while loading this page. Trying again usually clears it.
      </p>
      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button onClick={() => reset()}>
          <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
          Try again
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </div>
  );
}
