import type { ReactNode } from "react";
import { X } from "lucide-react";
import {
  DialogRoot,
  DialogPortal,
  DialogBackdrop,
  DialogPopup,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "./dialog";

type ModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  footer?: ReactNode;
  children: ReactNode;
};

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  footer,
  children,
}: ModalProps) {
  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogBackdrop />
        <DialogPopup>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <DialogTitle className="font-display text-2xl font-bold tracking-tight text-foreground">
                {title}
              </DialogTitle>
              {description ? (
                <DialogDescription className="max-w-xl text-sm leading-6 text-muted-foreground">
                  {description}
                </DialogDescription>
              ) : null}
            </div>

            <DialogClose className="rounded-lg border border-border p-2 text-muted-foreground transition-all hover:border-primary/40 hover:text-foreground hover:bg-primary/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <X className="h-4 w-4" />
            </DialogClose>
          </div>

          <div className="mt-6">{children}</div>

          {footer ? <div className="mt-6">{footer}</div> : null}
        </DialogPopup>
      </DialogPortal>
    </DialogRoot>
  );
}
