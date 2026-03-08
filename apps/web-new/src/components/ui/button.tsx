import { Button as BaseButton } from "@base-ui/react/button";
import { clsx } from "clsx";
import type { ComponentPropsWithoutRef } from "react";

type ButtonVariant = "primary" | "ghost" | "outline" | "secondary";
type ButtonSize = "sm" | "md" | "lg" | "xl";

type ButtonProps = ComponentPropsWithoutRef<typeof BaseButton> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground shadow-[0_0_0_1px_oklch(0.52_0.26_258_/_0.6),0_4px_16px_oklch(0.52_0.26_258_/_0.4)] hover:brightness-110 hover:-translate-y-px active:translate-y-0 active:brightness-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background data-[disabled]:opacity-50 data-[disabled]:pointer-events-none",
  ghost:
    "bg-transparent text-foreground hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background data-[disabled]:opacity-50 data-[disabled]:pointer-events-none",
  outline:
    "border border-border bg-transparent text-foreground hover:border-primary/60 hover:bg-primary/8 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background data-[disabled]:opacity-50 data-[disabled]:pointer-events-none",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background data-[disabled]:opacity-50 data-[disabled]:pointer-events-none",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3.5 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-sm",
  xl: "px-10 py-5 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <BaseButton
      className={clsx(
        "inline-flex cursor-pointer items-center justify-center gap-2 font-semibold tracking-tight transition-all duration-150 outline-none rounded-md",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {children}
    </BaseButton>
  );
}
