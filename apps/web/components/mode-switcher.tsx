"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function ModeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Prevent hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-9 w-full items-center justify-center rounded-lg bg-muted/50 px-1">
        <div className="h-7 w-7 animate-pulse rounded-md bg-muted" />
        <div className="h-7 w-7 animate-pulse rounded-md bg-muted" />
        <div className="h-7 w-7 animate-pulse rounded-md bg-muted" />
      </div>
    );
  }

  return (
    <ToggleGroup
      type="single"
      value={theme}
      onValueChange={(value) => {
        if (value) setTheme(value);
      }}
      className="w-full justify-between rounded-lg bg-muted/50 p-1"
    >
      <ToggleGroupItem
        value="light"
        aria-label="Light mode"
        className="flex-1 gap-1.5 data-[state=on]:bg-background data-[state=on]:shadow-sm"
      >
        <SunIcon className="size-4" />
        <span className="text-xs">Light</span>
      </ToggleGroupItem>
      <ToggleGroupItem
        value="dark"
        aria-label="Dark mode"
        className="flex-1 gap-1.5 data-[state=on]:bg-background data-[state=on]:shadow-sm"
      >
        <MoonIcon className="size-4" />
        <span className="text-xs">Dark</span>
      </ToggleGroupItem>
      <ToggleGroupItem
        value="system"
        aria-label="System mode"
        className="flex-1 gap-1.5 data-[state=on]:bg-background data-[state=on]:shadow-sm"
      >
        <MonitorIcon className="size-4" />
        <span className="text-xs">System</span>
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
