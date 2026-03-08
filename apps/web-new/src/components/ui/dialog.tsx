import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { clsx } from "clsx";
import type { ComponentPropsWithoutRef } from "react";

/* Re-export primitives for flexible usage */
export const DialogRoot = BaseDialog.Root;
export const DialogTrigger = BaseDialog.Trigger;
export const DialogTitle = BaseDialog.Title;
export const DialogDescription = BaseDialog.Description;
export const DialogClose = BaseDialog.Close;

/* Styled Backdrop */
export function DialogBackdrop({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof BaseDialog.Backdrop>) {
  return (
    <BaseDialog.Backdrop
      className={clsx(
        "fixed inset-0 z-40 bg-black/70 backdrop-blur-md",
        "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 transition-opacity duration-200",
        className,
      )}
      {...props}
    />
  );
}

/* Styled Portal wrapper */
export function DialogPortal({
  children,
  ...props
}: ComponentPropsWithoutRef<typeof BaseDialog.Portal>) {
  return <BaseDialog.Portal {...props}>{children}</BaseDialog.Portal>;
}

/* Styled Popup (the dialog panel) */
export function DialogPopup({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<typeof BaseDialog.Popup>) {
  return (
    <BaseDialog.Popup
      className={clsx(
        "fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2",
        "rounded-xl border border-border bg-card p-6 shadow-[0_40px_120px_rgba(0,0,0,0.7),0_0_0_1px_oklch(0.52_0.26_258_/_0.12)] sm:p-8",
        "data-[starting-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:translate-y-[-48%]",
        "data-[ending-style]:opacity-0 data-[ending-style]:scale-95",
        "transition-all duration-200",
        className,
      )}
      {...props}
    >
      {children}
    </BaseDialog.Popup>
  );
}
