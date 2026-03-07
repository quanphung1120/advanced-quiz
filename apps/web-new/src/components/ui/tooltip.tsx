import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import { clsx } from "clsx";
import type { ComponentPropsWithoutRef } from "react";

export const TooltipProvider = BaseTooltip.Provider;
export const TooltipRoot = BaseTooltip.Root;
export const TooltipTrigger = BaseTooltip.Trigger;
export const TooltipPortal = BaseTooltip.Portal;

export function TooltipPositioner({
  sideOffset = 6,
  ...props
}: ComponentPropsWithoutRef<typeof BaseTooltip.Positioner>) {
  return <BaseTooltip.Positioner sideOffset={sideOffset} {...props} />;
}

export function TooltipPopup({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<typeof BaseTooltip.Popup>) {
  return (
    <BaseTooltip.Popup
      className={clsx(
        "rounded-md border border-border bg-card px-3 py-1.5 text-xs text-foreground shadow-lg",
        "data-[starting-style]:opacity-0 data-[starting-style]:scale-95",
        "data-[ending-style]:opacity-0 data-[ending-style]:scale-95",
        "data-[instant]:transition-none transition-all duration-150",
        className,
      )}
      {...props}
    >
      {children}
    </BaseTooltip.Popup>
  );
}

export function TooltipArrow({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof BaseTooltip.Arrow>) {
  return (
    <BaseTooltip.Arrow className={clsx("fill-card", className)} {...props} />
  );
}
