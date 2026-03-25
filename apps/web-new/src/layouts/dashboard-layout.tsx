import { useState, type PropsWithChildren } from "react";
import { Link, useLocation } from "react-router";
import {
  BookMarked,
  BrainCircuit,
  ChevronDown,
  LogOut,
  MessagesSquare,
  Sparkles,
  SquareTerminal,
  type LucideIcon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@advanced-quiz/ui/components/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@advanced-quiz/ui/components/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@advanced-quiz/ui/components/dropdown-menu";
import { Separator } from "@advanced-quiz/ui/components/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@advanced-quiz/ui/components/sidebar";
import { LoadingState } from "@/components/loading-state";
import { ModeToggle } from "@/components/mode-toggle";
import { signOut, useSession } from "@/features/auth/api/auth-client";
import { cn } from "@/utils/cn";

type DashboardNavItem = {
  href: string;
  icon: LucideIcon;
  label: string;
  match: (pathname: string) => boolean;
};

const dashboardNavItems: DashboardNavItem[] = [
  {
    href: "/dashboard",
    icon: BrainCircuit,
    label: "Collections",
    match: (pathname) =>
      pathname === "/dashboard" ||
      pathname.startsWith("/dashboard/collections/"),
  },
  {
    href: "/dashboard/chat",
    icon: MessagesSquare,
    label: "Chat",
    match: (pathname) =>
      pathname === "/dashboard/chat" || pathname.startsWith("/dashboard/chat/"),
  },
];

function getDashboardTitle(pathname: string) {
  if (pathname === "/dashboard/chat" || pathname === "/dashboard/chat/sessions") {
    return {
      section: "Workspace",
      page: "Session List",
    };
  }

  if (isChatThreadView(pathname)) {
    return {
      section: "Workspace",
      page: "Chat",
    };
  }

  if (pathname.startsWith("/dashboard/collections/")) {
    return {
      section: "Workspace",
      page: "Collection",
    };
  }

  if (pathname === "/dashboard") {
    return {
      section: "Workspace",
      page: "Collections",
    };
  }

  return {
    section: "Dashboard",
    page: "Study Space",
  };
}

function isChatThreadView(pathname: string) {
  return (
    (pathname.startsWith("/dashboard/chat/") &&
      pathname !== "/dashboard/chat/sessions" &&
      pathname !== "/dashboard/chat/new") ||
    pathname === "/dashboard/chat/new"
  );
}

function getInitials(name?: string | null) {
  if (!name) {
    return "AQ";
  }

  return (
    name
      .split(" ")
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "AQ"
  );
}

function DashboardAccountMenu() {
  const { data: session, isPending } = useSession();
  const { isMobile } = useSidebar();

  const userName = session?.user?.name ?? "Learner";
  const userEmail = session?.user?.email ?? "Signed in";
  const initials = getInitials(session?.user?.name);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="h-auto min-h-12 data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground"
              />
            }
          >
            <Avatar size="default">
              <AvatarFallback>
                {isPending ? <BookMarked /> : initials}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left leading-tight">
              <span className="truncate text-sm font-medium">
                {isPending ? "Loading..." : userName}
              </span>
              <span className="truncate text-xs text-sidebar-foreground/70">
                {userEmail}
              </span>
            </div>
            <ChevronDown className="ml-auto" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="min-w-56"
            side={isMobile ? "bottom" : "right"}
            sideOffset={8}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="flex items-center gap-2 py-1 text-left">
                  <Avatar size="default">
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 leading-tight">
                    <span className="truncate text-sm font-medium">
                      {userName}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {userEmail}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem render={<Link to="/dashboard" />}>
                <SquareTerminal />
                Dashboard
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()}>
              <LogOut />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function DashboardSidebar() {
  const pathname = useLocation().pathname;

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="Advanced Quiz"
              render={<Link to="/dashboard" />}
            >
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate text-sm font-semibold">
                  Advanced Quiz
                </span>
                <span className="truncate text-xs text-sidebar-foreground/70">
                  Study workspace
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {dashboardNavItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    isActive={item.match(pathname)}
                    tooltip={item.label}
                    render={<Link to={item.href} />}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel>Study Rhythm</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="flex flex-col gap-2 border border-sidebar-border bg-sidebar-accent/40 p-3">
              <div className="inline-flex items-center gap-2 text-sidebar-foreground">
                <Sparkles />
                <span className="text-xs font-medium">15-minute wins</span>
              </div>
              <p className="text-xs leading-5 text-sidebar-foreground/75">
                Review a few cards every day. Small sessions compound faster
                than long catch-up cramming.
              </p>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="gap-3">
        <DashboardAccountMenu />
      </SidebarFooter>
    </Sidebar>
  );
}

function DashboardHeader() {
  const pathname = useLocation().pathname;
  const title = getDashboardTitle(pathname);

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="flex w-full items-center gap-2 px-4 sm:px-6 lg:px-8">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:inline-flex">
              <BreadcrumbLink render={<Link to="/dashboard" />}>
                {title.section}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>{title.page}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <ModeToggle className="ml-auto" />
      </div>
    </header>
  );
}

export function DashboardLayout({
  children,
  isLoading = false,
}: PropsWithChildren<{ isLoading?: boolean }>) {
  const pathname = useLocation().pathname;
  const isChatThreadRoute = isChatThreadView(pathname);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window === "undefined") {
      return true;
    }

    return localStorage.getItem("sidebar-collapsed") !== "true";
  });

  const handleOpenChange = (open: boolean) => {
    setIsSidebarOpen(open);
    localStorage.setItem("sidebar-collapsed", String(!open));
  };

  return (
    <SidebarProvider
      open={isSidebarOpen}
      onOpenChange={handleOpenChange}
      className="min-h-screen bg-background text-foreground"
    >
      <DashboardSidebar />
      <SidebarInset className="min-h-screen">
        <DashboardHeader />
        <main
          className={cn(
            "flex-1",
            isChatThreadRoute && "flex min-h-0 overflow-hidden",
          )}
        >
          <div
            className={cn(
              "w-full",
              isChatThreadRoute
                ? "flex min-h-[calc(100svh-3.5rem)] flex-1 flex-col"
                : "mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-6",
            )}
          >
            {isLoading ? (
              <LoadingState />
            ) : (
              children
            )}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
