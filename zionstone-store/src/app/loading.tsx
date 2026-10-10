import { Skeleton } from "@/components/ui/skeleton";

/**
 * Route-level loading state.
 *
 * Geometry is copied from the real surfaces so the swap does not reflow:
 *  - the PDP split, `src/app/products/[slug]/page.tsx:67` (`grid-cols-1 lg:grid-cols-2 gap-12`)
 *    with its `aspect-square` media block;
 *  - the listing grid, `src/app/products/page.tsx:384` (`lg:grid-cols-3 xl:grid-cols-4 gap-6`)
 *    with cards whose media is flush to the card edge (`overflow-hidden` + `rounded-card`).
 *
 * A single root `loading.tsx` cannot know which route it is standing in for, so this is
 * the union of the two heaviest commerce surfaces. Put a scoped `loading.tsx` under
 * `products/` if either route needs its own frame.
 *
 * Motion: the only animation is the `animate-pulse` already inside `Skeleton`. It is
 * neutralised by the `prefers-reduced-motion` block in `globals.css:111-119`, so no
 * new `animate-*` is introduced here and reduced-motion users get static blocks.
 */
export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="container mx-auto px-4 py-12 md:py-16"
    >
      <span className="sr-only">Loading page</span>

      {/* Decorative: the blocks carry no information a screen reader needs, and the
          announcement above is the whole message. */}
      <div aria-hidden="true">
        {/* Breadcrumb stand-in, `products/[slug]/page.tsx:62`. */}
        <Skeleton className="mb-6 h-4 w-32 rounded-pill" />

        {/* PDP split. */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div className="space-y-4">
            <Skeleton className="aspect-square rounded-card" />
            <div className="flex gap-3">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-20 flex-shrink-0 rounded-card" />
              ))}
            </div>
          </div>

          <div>
            <Skeleton className="mb-2 h-3 w-24" />
            <Skeleton className="mb-4 h-9 w-3/4 md:h-10" />
            <Skeleton className="mb-4 h-4 w-40" />
            <Skeleton className="mb-4 h-9 w-28" />
            <Skeleton className="mb-6 h-28 w-full rounded-card" />
            <Skeleton className="mb-6 h-40 w-full rounded-card" />
            <div className="flex gap-3">
              <Skeleton className="h-10 w-32 rounded-pill" />
              <Skeleton className="h-10 w-10 rounded-pill" />
            </div>
          </div>
        </div>

        {/* Listing grid. */}
        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-card border border-border bg-card"
            >
              <Skeleton className="aspect-square rounded-none" />
              <div className="p-4">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="mt-2 h-4 w-full" />
                <Skeleton className="mt-1 h-4 w-2/3" />
                <Skeleton className="mt-3 h-5 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
