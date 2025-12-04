// features/dashboard/components/collection-card-skeleton.tsx
"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function CollectionCardSkeleton() {
  return (
    <div
      className="group relative animate-fade-in opacity-0"
      style={{ animationFillMode: "forwards" }}
    >
      {/* Kahoot-style card skeleton matching CollectionCard design */}
      <div className="relative overflow-hidden rounded-2xl border border-border/30 shadow-lg">
        {/* Gradient Header Skeleton with shimmer */}
        <div className="relative h-32 overflow-hidden bg-linear-to-br from-muted/60 to-muted/40">
          {/* Shimmer overlay */}
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-linear-to-r from-transparent via-white/10 to-transparent" />

          {/* Decorative shapes skeleton */}
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-muted/30" />
          <div className="absolute -bottom-6 -left-6 h-20 w-20 rounded-full bg-muted/20" />
          <div className="absolute bottom-4 right-4 h-12 w-12 rotate-12 rounded-lg bg-muted/30" />

          {/* Icon skeleton */}
          <div className="absolute left-4 top-4">
            <Skeleton className="h-10 w-10 rounded-xl" />
          </div>
        </div>

        {/* Content Section Skeleton */}
        <div className="bg-card p-4">
          <Skeleton className="mb-2 h-6 w-3/4" />
          <div className="mb-3 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>

          {/* Footer skeleton */}
          <div className="flex items-center justify-between gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-20 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CollectionCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <CollectionCardSkeleton key={i} />
      ))}
    </div>
  );
}
