import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import type { ComponentPropsWithoutRef, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Dialog = BaseDialog.Root;
export const DialogTrigger = BaseDialog.Trigger;
export const DialogClose = BaseDialog.Close;
export const DialogTitlePrimitive = BaseDialog.Title;
export const DialogDescriptionPrimitive = BaseDialog.Description;

export function DialogPortal({
  children,
  ...props
}: ComponentPropsWithoutRef<typeof BaseDialog.Portal>) {
  return <BaseDialog.Portal {...props}>{children}</BaseDialog.Portal>;
}

export function DialogOverlay({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof BaseDialog.Backdrop>) {
  return (
    <BaseDialog.Backdrop
      className={cn(
        "fixed inset-0 z-40 bg-black/70 backdrop-blur-md",
        "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 transition-opacity duration-200",
        className,
      )}
      {...props}
    />
  );
}

export function DialogPopup({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<typeof BaseDialog.Popup>) {
  return (
    <BaseDialog.Popup
      className={cn(
        "fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2",
        "max-h-[calc(100vh-2rem)] overflow-y-auto",
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

type DialogContentProps = ComponentPropsWithoutRef<typeof BaseDialog.Popup> & {
  overlayClassName?: string;
  showClose?: boolean;
};

export function DialogContent({
  children,
  className,
  overlayClassName,
  showClose = true,
  ...props
}: DialogContentProps) {
  return (
    <DialogPortal>
      <DialogOverlay className={overlayClassName} />
      <DialogPopup className={cn("pr-14", className)} {...props}>
        {children}
        {showClose ? (
          <DialogClose className="absolute right-6 top-6 rounded-lg border border-border p-2 text-muted-foreground transition-all hover:border-primary/40 hover:bg-primary/8 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:right-8 sm:top-8">
            <X className="h-4 w-4" />
            <span className="sr-only">Close dialog</span>
          </DialogClose>
        ) : null}
      </DialogPopup>
    </DialogPortal>
  );
}

export function DialogHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-1.5", className)} {...props} />;
}

export function DialogBody({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-6", className)} {...props} />;
}

export function DialogFooter({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mt-6 flex flex-wrap justify-end gap-3 border-t border-border/60 pt-4",
        className,
      )}
      {...props}
    />
  );
}

export function DialogTitle({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof DialogTitlePrimitive>) {
  return (
    <DialogTitlePrimitive
      className={cn("font-display text-2xl font-bold tracking-tight text-foreground", className)}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof DialogDescriptionPrimitive>) {
  return (
    <DialogDescriptionPrimitive
      className={cn("max-w-xl text-sm leading-6 text-muted-foreground", className)}
      {...props}
    />
  );
}

export const DialogRoot = Dialog;
export const DialogBackdrop = DialogOverlay;
