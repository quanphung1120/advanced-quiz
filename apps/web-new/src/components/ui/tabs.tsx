import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import { clsx } from "clsx";
import type { ComponentPropsWithoutRef } from "react";

export const TabsRoot = BaseTabs.Root;
export const TabsPanel = BaseTabs.Panel;

export function TabsList({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof BaseTabs.List>) {
  return (
    <BaseTabs.List
      className={clsx(
        "relative inline-flex items-center gap-1 rounded-lg border border-border bg-muted/50 p-1",
        className,
      )}
      {...props}
    />
  );
}

export function TabsTab({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof BaseTabs.Tab>) {
  return (
    <BaseTabs.Tab
      className={clsx(
        "relative z-10 cursor-pointer rounded-md px-5 py-1.5 text-sm font-medium text-muted-foreground tracking-tight transition-colors",
        "data-[active]:text-primary-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      {...props}
    />
  );
}

export function TabsIndicator({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof BaseTabs.Indicator>) {
  return (
    <BaseTabs.Indicator
      className={clsx(
        "absolute top-1 left-[var(--active-tab-left)] h-[calc(100%-8px)] w-[var(--active-tab-width)]",
        "rounded-md bg-primary shadow-[0_0_12px_oklch(0.52_0.26_258_/_0.5)] transition-all duration-200",
        className,
      )}
      {...props}
    />
  );
}
