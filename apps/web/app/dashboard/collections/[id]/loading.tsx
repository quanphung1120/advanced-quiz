import { Skeleton } from "@/components/ui/skeleton";

export default function CollectionDetailLoading() {
  return (
    <div className="container mx-auto max-w-4xl space-y-8 px-4 py-8">
      {/* Hero Header Skeleton */}
      <div className="overflow-hidden rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm">
        {/* Gradient Banner Skeleton */}
        <div className="relative h-24 overflow-hidden bg-linear-to-br from-muted/60 to-muted/40">
          {/* Shimmer overlay */}
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-linear-to-r from-transparent via-white/10 to-transparent" />

          {/* Decorative shapes */}
          <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-muted/30" />
          <div className="absolute -bottom-6 -left-6 h-16 w-16 rounded-full bg-muted/20" />

          {/* Icon skeleton */}
          <div className="absolute left-6 top-1/2 -translate-y-1/2">
            <Skeleton className="h-14 w-14 rounded-xl" />
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-5 w-96" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-32" />
            </div>
          </div>

          {/* Metadata Pills Skeleton */}
          <div className="mt-4 flex flex-wrap gap-3">
            <Skeleton className="h-7 w-36 rounded-full" />
            <Skeleton className="h-7 w-36 rounded-full" />
            <Skeleton className="h-7 w-28 rounded-full" />
          </div>
        </div>
      </div>

      {/* Collaborators Section Skeleton */}
      <div className="rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>

      {/* Flashcards Section Skeleton */}
      <div className="rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-border/30 bg-background p-4"
            >
              <Skeleton className="mb-3 h-5 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
