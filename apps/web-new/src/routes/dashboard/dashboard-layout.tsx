import { Outlet } from "react-router";
import { DashboardLayout as Shell } from "@/components/layout/dashboard-layout";

export function DashboardLayout({
  isLoading = false,
}: {
  isLoading?: boolean;
}) {
  return (
    <Shell isLoading={isLoading}>
      <Outlet />
    </Shell>
  );
}
