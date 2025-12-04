import { DashboardPageSkeleton } from "@/features/dashboard/components/dashboard-skeleton";

export default function DashboardLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 pt-2">
      <DashboardPageSkeleton />
    </div>
  );
}
