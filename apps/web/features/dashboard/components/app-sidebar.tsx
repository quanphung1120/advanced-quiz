"use client";

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
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { UserDropdown } from "./user-dropdown";
import type { Collection } from "@/types/collection";
import { CreateCollectionDialog } from "@/features/collections/components/create-collection-dialog";

const navItems = [
  {
    title: "Collections",
    url: "/dashboard",
    icon: FolderIcon,
  },
  {
    title: "Review",
    url: "/dashboard/review",
    icon: BookOpenIcon,
  },
  {
    title: "Analytics",
    url: "/dashboard/analytics",
    icon: BarChart3Icon,
  },
  {
    title: "Community",
    url: "/dashboard/community",
    icon: UsersIcon,
  },
];

interface AppSidebarProps {
  collections: Collection[];
}

export function AppSidebar({ collections }: AppSidebarProps) {
  // Get the most recent 6 collections for the sidebar
  const recentCollections = collections
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )
    .slice(0, 6);

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <BookOpenIcon className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Recallly</span>
                  <span className="text-xs text-muted-foreground">
                    Flashcard Learning
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <CreateCollectionDialog />
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link href={item.url}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Recent Collections */}
        <SidebarGroup className="flex-1">
          <SidebarGroupLabel>Recents</SidebarGroupLabel>
          <SidebarGroupAction title="View All">
            <ChevronRightIcon className="size-4" />
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              {recentCollections.map((collection) => (
                <SidebarMenuItem key={collection.id}>
                  <SidebarMenuButton asChild tooltip={collection.name}>
                    <Link href={`/dashboard/collections/${collection.id}`}>
                      <FolderIcon className="size-4" />
                      <span className="truncate">{collection.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <UserDropdown />
      </SidebarFooter>
    </Sidebar>
  );
}
