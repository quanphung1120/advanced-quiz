import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/features/dashboard/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { getCollections } from "@/features/collections/service/api";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const collections = await getCollections();

  return (
    <SidebarProvider>
      <AppSidebar collections={collections} />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-sm font-medium">Dashboard</h1>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
