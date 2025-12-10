import { BellIcon } from "lucide-react";

import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/features/dashboard/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { getCollections } from "@/features/collections/service/api";
import { HeaderUserDropdown } from "@/features/dashboard/components/header-user-dropdown";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const collectionsPromise = getCollections();

  return (
    <SidebarProvider>
      <AppSidebar collectionsPromise={collectionsPromise} />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border/50 bg-background/95 px-4 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1 transition-colors hover:bg-primary/10 hover:text-primary" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex items-center gap-2">
              <h1 className="font-display text-sm font-medium">Dashboard</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative transition-colors hover:bg-primary/10 hover:text-primary"
            >
              <BellIcon className="size-5" />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground shadow-sm">
                3
              </span>
              <span className="sr-only">Notifications</span>
            </Button>
            <HeaderUserDropdown />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
