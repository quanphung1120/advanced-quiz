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
        "relative flex items-center gap-0 border-b border-border",
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
        "relative cursor-pointer px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground transition-colors",
        "data-[active]:text-foreground",
        "hover:text-foreground",
        "focus-visible:outline-none",
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
        "absolute bottom-[-1px] left-[var(--active-tab-left)] h-px w-[var(--active-tab-width)]",
        "bg-foreground transition-all duration-200",
        className,
      )}
      {...props}
    />
  );
}
