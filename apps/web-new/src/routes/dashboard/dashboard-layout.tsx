import { Outlet } from "react-router";
import { DashboardLayout as Shell } from "@/components/layout/dashboard-layout";

export function DashboardLayout() {
  return (
    <Shell>
      <Outlet />
    </Shell>
  );
}
