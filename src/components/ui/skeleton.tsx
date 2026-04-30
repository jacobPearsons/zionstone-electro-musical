import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export { Skeleton };

export function ProductCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-4">
      <Skeleton className="aspect-square rounded-lg" />
      <Skeleton className="h-4 w-20 mt-4" />
      <Skeleton className="h-5 w-full mt-2" />
      <Skeleton className="h-5 w-2/3 mt-2" />
      <Skeleton className="h-6 w-24 mt-4" />
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}