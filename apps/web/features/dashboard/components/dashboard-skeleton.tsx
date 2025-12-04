// features/dashboard/components/dashboard-skeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";
import { CollectionCardSkeletonGrid } from "./collection-card-skeleton";

export function DashboardPageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      {/* Hero Section Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-80" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>

      {/* Search Section Skeleton */}
      <Skeleton className="h-12 w-full rounded-lg" />

      {/* Tabs Skeleton */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32 rounded-md" />
          <Skeleton className="h-10 w-28 rounded-md" />
        </div>

        {/* Collection Grid Skeleton */}
        <CollectionCardSkeletonGrid count={6} />
      </div>
    </div>
  );
}

export function DashboardHeroSkeleton() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-3">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-5 w-80" />
      </div>
      <Skeleton className="h-10 w-36" />
    </div>
  );
}
