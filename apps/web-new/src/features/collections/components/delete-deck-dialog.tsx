import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  DialogRoot,
  DialogBackdrop,
  DialogPortal,
  DialogPopup,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, X } from "lucide-react";

const deleteDeckSchema = z.object({
  confirmName: z.string().min(1, "Please type the deck name"),
});

type DeleteDeckFormData = z.infer<typeof deleteDeckSchema>;

type DeleteDeckDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deckName: string;
  onConfirm: () => void;
  isPending: boolean;
};

export function DeleteDeckDialog({
  open,
  onOpenChange,
  deckName,
  onConfirm,
  isPending,
}: DeleteDeckDialogProps) {
  const [inputValue, setInputValue] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DeleteDeckFormData>({
    resolver: zodResolver(deleteDeckSchema),
    defaultValues: {
      confirmName: "",
    },
  });

  const onSubmit = (data: DeleteDeckFormData) => {
    if (data.confirmName === deckName) {
      onConfirm();
      reset();
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      reset();
      setInputValue("");
    }
    onOpenChange(isOpen);
  };

  return (
    <DialogRoot open={open} onOpenChange={handleClose}>
      <DialogPortal>
        <DialogBackdrop />
        <DialogPopup>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <DialogTitle className="text-lg font-semibold text-foreground">
                  Delete deck
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  This will permanently delete this deck and all its cards.
                </DialogDescription>
              </div>
              <button
                type="button"
                onClick={() => handleClose(false)}
                className="rounded-sm p-1 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-medium text-foreground">
                Type{" "}
                <span className="text-primary font-semibold">{deckName}</span>{" "}
                to confirm
              </label>
              <input
                type="text"
                {...register("confirmName")}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full rounded-sm border border-border bg-muted/30 px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
                placeholder={`Type "${deckName}"`}
              />
              {errors.confirmName && (
                <p className="text-[11px] text-destructive">
                  {errors.confirmName.message}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleClose(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="outline"
                size="sm"
                disabled={inputValue !== deckName || isPending}
                className="border-destructive/30 text-destructive hover:border-destructive hover:bg-destructive/5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            </div>
          </form>
        </DialogPopup>
      </DialogPortal>
    </DialogRoot>
  );
}
