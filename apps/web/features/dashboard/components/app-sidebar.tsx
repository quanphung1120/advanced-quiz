"use client";

import { use, Suspense } from "react";
import Link from "next/link";
import {
  FolderIcon,
  BookOpenIcon,
  BarChart3Icon,
  UsersIcon,
  ChevronRightIcon,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import type { Collection } from "@/features/collections/service/api";

import { Badge } from "@/components/ui/badge";

const navItems = [
  {
    title: "Collections",
    url: "/dashboard",
    icon: FolderIcon,
    comingSoon: false,
  },
  {
    title: "Review",
    url: "/dashboard/review",
    icon: BookOpenIcon,
    comingSoon: true,
  },
  {
    title: "Analytics",
    url: "/dashboard/analytics",
    icon: BarChart3Icon,
    comingSoon: true,
  },
  {
    title: "Community",
    url: "/dashboard/community",
    icon: UsersIcon,
    comingSoon: true,
  },
];

function RecentSectionSkeleton() {
  return (
    <SidebarMenu>
      {Array.from({ length: 4 }).map((_, index) => (
        <SidebarMenuItem key={index}>
          <div className="flex items-center gap-2 px-2 py-1.5">
            <Skeleton className="size-4 rounded" />
            <Skeleton className="h-4 flex-1" />
          </div>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

interface RecentCollectionsListProps {
  collectionsPromise: Promise<Collection[]>;
}

function RecentCollectionsList({
  collectionsPromise,
}: RecentCollectionsListProps) {
  const collections = use(collectionsPromise);

  // Get the most recent 6 collections for the sidebar
  const recentCollections = collections
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )
    .slice(0, 6);

  if (recentCollections.length === 0) {
    return (
      <div className="px-2 py-4 text-center">
        <p className="text-xs text-muted-foreground">No collections yet</p>
      </div>
    );
  }

  return (
    <SidebarMenu>
      {recentCollections.map((collection) => (
        <SidebarMenuItem key={collection.id}>
          <SidebarMenuButton
            asChild
            tooltip={collection.name}
            className="transition-all hover:bg-primary/10 hover:text-primary"
          >
            <Link
              href={`/dashboard/collections/${collection.id}`}
              prefetch={false}
            >
              <FolderIcon className="size-4" />
              <span className="truncate">{collection.name}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

interface AppSidebarProps {
  collectionsPromise: Promise<Collection[]>;
}

export function AppSidebar({ collectionsPromise }: AppSidebarProps) {
  return (
    <Sidebar className="border-r border-border/50">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="transition-colors hover:bg-primary/10"
            >
              <Link href="/dashboard" prefetch={false}>
                <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-linear-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20">
                  <BookOpenIcon className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-display text-base">Recallly</span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    Flashcard Learning
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium uppercase tracking-widest text-muted-foreground/70">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    className="transition-all hover:bg-primary/10 hover:text-primary data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
                  >
                    <Link
                      href={item.url}
                      className="flex items-center gap-2"
                      prefetch={false}
                    >
                      <item.icon className="size-4" />
                      <span className="flex-1">{item.title}</span>
                      {item.comingSoon && (
                        <Badge
                          variant="secondary"
                          className="bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary"
                        >
                          Soon
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Recent Collections */}
        <SidebarGroup className="flex-1">
          <SidebarGroupLabel className="text-xs font-medium uppercase tracking-widest text-muted-foreground/70">
            Recents
          </SidebarGroupLabel>
          <SidebarGroupAction
            title="View All"
            className="transition-colors hover:bg-primary/10 hover:text-primary"
          >
            <ChevronRightIcon className="size-4" />
          </SidebarGroupAction>
          <SidebarGroupContent>
            <Suspense fallback={<RecentSectionSkeleton />}>
              <RecentCollectionsList collectionsPromise={collectionsPromise} />
            </Suspense>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
