import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export const inputClassName =
  "w-full rounded-lg border border-border bg-background px-4 py-3.5 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/50 focus:border-primary/60 focus:bg-primary/5";

export const inputGroupClassName =
  "flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3.5 transition-all focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/5";

export const inputAdornmentClassName = "h-4 w-4 shrink-0 text-muted-foreground";

export const Input = forwardRef<
  HTMLInputElement,
  ComponentPropsWithoutRef<"input">
>(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cn(inputClassName, className)} {...props} />;
});

export function InputGroup({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return <div className={cn(inputGroupClassName, className)} {...props} />;
}

export function InputAdornment({
  className,
  ...props
}: ComponentPropsWithoutRef<"span">) {
  return <span className={cn(inputAdornmentClassName, className)} {...props} />;
}
