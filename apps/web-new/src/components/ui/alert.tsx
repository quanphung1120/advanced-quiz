import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type AlertVariant = "default" | "success" | "destructive";

const variantClasses: Record<AlertVariant, string> = {
  default: "border border-border bg-card text-card-foreground",
  success:
    "border border-emerald-500/50 bg-emerald-500/10 text-sm font-medium text-emerald-500 dark:text-emerald-400",
  destructive:
    "border border-destructive/50 bg-destructive/10 text-sm font-medium text-destructive",
};

type AlertProps = HTMLAttributes<HTMLDivElement> & {
  variant?: AlertVariant;
};

export function Alert({
  className,
  variant = "default",
  ...props
}: AlertProps) {
  return (
    <div
      className={cn("rounded-lg px-4 py-3", variantClasses[variant], className)}
      {...props}
    />
  );
}
