"use client";

import { ChevronDown, Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@advanced-quiz/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@advanced-quiz/ui/components/dropdown-menu";
import { useTheme } from "@/context/theme-provider";
import { cn } from "@/utils/cn";

const themeOptions = [
  { value: "light" as const, label: "Light", icon: Sun },
  { value: "dark" as const, label: "Dark", icon: Moon },
  { value: "system" as const, label: "System", icon: Monitor },
];

type ModeToggleProps = {
  className?: string;
  showLabel?: boolean;
};

export function ModeToggle({
  className,
  showLabel = false,
}: ModeToggleProps) {
  const { theme, setTheme } = useTheme();
  const activeTheme = themeOptions.find((option) => option.value === theme) ?? {
    value: "system" as const,
    label: "System",
    icon: Monitor,
  };
  const ActiveIcon = activeTheme.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Toggle theme"
        render={
          <Button
            variant="outline"
            size={showLabel ? "default" : "icon-sm"}
            className={cn(
              showLabel && "w-full justify-between px-3 text-xs",
              className,
            )}
          />
        }
      >
        <span className="inline-flex items-center gap-2">
          <ActiveIcon data-icon="inline-start" />
          {showLabel ? <span>{activeTheme.label}</span> : null}
        </span>
        {showLabel ? <ChevronDown data-icon="inline-end" /> : null}
        <span className="sr-only">Toggle theme</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        {themeOptions.map(({ value, label, icon: Icon }) => (
          <DropdownMenuItem key={value} onClick={() => setTheme(value)}>
            <Icon />
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
