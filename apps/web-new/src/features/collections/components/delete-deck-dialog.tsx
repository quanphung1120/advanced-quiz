import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@advanced-quiz/ui/components/alert-dialog";
import { Button } from "@advanced-quiz/ui/components/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@advanced-quiz/ui/components/field";
import { Input } from "@advanced-quiz/ui/components/input";
import { Trash2 } from "lucide-react";

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
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <AlertDialogHeader className="pr-8">
            <AlertDialogTitle className="text-lg font-semibold">
              Delete deck
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              This will permanently delete this deck and all its cards.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <FieldGroup>
            <Field>
              <FieldLabel className="text-[13px] normal-case tracking-normal text-foreground">
                Type <span className="font-semibold text-primary">{deckName}</span>{" "}
                to confirm
              </FieldLabel>
              <Input
                type="text"
                {...register("confirmName")}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="rounded-sm bg-muted/30 px-3 py-2 text-[13px] focus:ring-1 focus:ring-primary/50"
                placeholder={`Type "${deckName}"`}
              />
              {errors.confirmName ? (
                <FieldError className="text-[11px]">
                  {errors.confirmName.message}
                </FieldError>
              ) : null}
            </Field>
          </FieldGroup>

          <AlertDialogFooter>
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
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
