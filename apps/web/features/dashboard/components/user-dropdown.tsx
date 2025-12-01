"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import {
  SettingsIcon,
  GlobeIcon,
  HelpCircleIcon,
  InfoIcon,
  LogOutIcon,
  BellIcon,
  KeyboardIcon,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function UserDropdown() {
  const { user, isLoaded } = useUser();
  const { openUserProfile, signOut } = useClerk();

  if (!isLoaded) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" className="animate-pulse">
            <div className="size-8 rounded-full bg-muted" />
            <div className="grid flex-1 gap-1">
              <div className="h-4 w-24 rounded bg-muted" />
              <div className="h-3 w-32 rounded bg-muted" />
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  if (!user) {
    return null;
  }

  const userEmail = user.primaryEmailAddress?.emailAddress || "";
  const userName = user.fullName || user.firstName || "User";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleOpenAccountSettings = () => {
    openUserProfile();
  };

  const handleSignOut = () => {
    signOut({ redirectUrl: "/" });
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="size-8">
                <AvatarImage src={user.imageUrl} alt={userName} />
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{userName}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {userEmail}
                </span>
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-64 rounded-xl"
            side="top"
            align="start"
            sideOffset={8}
          >
            {/* User Info Header */}
            <div className="px-3 py-2.5 text-sm text-muted-foreground">
              {userEmail}
            </div>

            <DropdownMenuSeparator />

            {/* Main Actions */}
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={handleOpenAccountSettings}
                className="gap-3 py-2.5"
              >
                <SettingsIcon className="size-4 text-muted-foreground" />
                <span>Settings</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  ⇧+Ctrl+,
                </span>
              </DropdownMenuItem>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="gap-3 py-2.5">
                  <GlobeIcon className="size-4 text-muted-foreground" />
                  <span>Language</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-40 rounded-xl">
                  <DropdownMenuItem>English</DropdownMenuItem>
                  <DropdownMenuItem>Español</DropdownMenuItem>
                  <DropdownMenuItem>Français</DropdownMenuItem>
                  <DropdownMenuItem>Deutsch</DropdownMenuItem>
                  <DropdownMenuItem>日本語</DropdownMenuItem>
                  <DropdownMenuItem>한국어</DropdownMenuItem>
                  <DropdownMenuItem>Tiếng Việt</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuItem className="gap-3 py-2.5">
                <HelpCircleIcon className="size-4 text-muted-foreground" />
                <span>Get help</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {/* Preferences (disabled) */}
            <DropdownMenuGroup>
              <DropdownMenuItem disabled className="gap-3 py-2.5">
                <InfoIcon className="size-4 text-muted-foreground" />
                <span>Appearance</span>
              </DropdownMenuItem>
              <DropdownMenuItem disabled className="gap-3 py-2.5">
                <BellIcon className="size-4 text-muted-foreground" />
                <span>Notifications</span>
              </DropdownMenuItem>
              <DropdownMenuItem disabled className="gap-3 py-2.5">
                <KeyboardIcon className="size-4 text-muted-foreground" />
                <span>Keyboard shortcuts</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {/* Log Out */}
            <DropdownMenuItem onClick={handleSignOut} className="gap-3 py-2.5">
              <LogOutIcon className="size-4 text-muted-foreground" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
