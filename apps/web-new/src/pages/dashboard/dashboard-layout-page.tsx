import { Outlet } from "react-router";
import { DashboardLayout } from "@/layouts/dashboard-layout";

export function DashboardPageLayout({
  isLoading = false,
}: {
  isLoading?: boolean;
}) {
  return (
    <DashboardLayout isLoading={isLoading}>
      <Outlet />
    </DashboardLayout>
  );
}
