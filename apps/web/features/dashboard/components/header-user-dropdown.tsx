"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import {
  SettingsIcon,
  GlobeIcon,
  HelpCircleIcon,
  LogOutIcon,
  BellIcon,
  KeyboardIcon,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { ModeSwitcher } from "@/components/mode-switcher";

export function HeaderUserDropdown() {
  const { user, isLoaded } = useUser();
  const { openUserProfile, signOut } = useClerk();

  if (!isLoaded) {
    return (
      <Button variant="ghost" size="icon" className="relative">
        <div className="size-8 rounded-full bg-muted animate-pulse" />
      </Button>
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full">
          <Avatar className="size-8">
            <AvatarImage src={user.imageUrl} alt={userName} />
            <AvatarFallback className="text-xs">{userInitials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-64 rounded-xl"
        align="end"
        sideOffset={8}
      >
        {/* User Info Header */}
        <div className="flex items-center gap-3 px-3 py-3">
          <Avatar className="size-10">
            <AvatarImage src={user.imageUrl} alt={userName} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{userName}</span>
            <span className="text-xs text-muted-foreground">{userEmail}</span>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Theme Switcher */}
        <div className="px-2 py-2">
          <DropdownMenuLabel className="px-1 py-1.5 text-xs font-normal text-muted-foreground">
            Appearance
          </DropdownMenuLabel>
          <ModeSwitcher />
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
  );
}
