import { useEffect } from "react";
import type { FlashcardType } from "@advanced-quiz/contracts";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@advanced-quiz/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@advanced-quiz/ui/components/dialog";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@advanced-quiz/ui/components/field";
import { Textarea } from "@advanced-quiz/ui/components/textarea";

type FlashcardValues = {
  question: string;
  answer: string;
  type: FlashcardType;
};

const flashcardFormSchema = z.object({
  question: z.string().trim().min(1, "Question is required"),
  answer: z.string().trim().min(1, "Answer is required"),
});

type FlashcardFormValues = z.infer<typeof flashcardFormSchema>;

function getDefaultValues(initialValues?: FlashcardValues): FlashcardFormValues {
  return {
    question: initialValues?.question ?? "",
    answer: initialValues?.answer ?? "",
  };
}

type FlashcardFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  submitLabel: string;
  isPending?: boolean;
  initialValues?: FlashcardValues;
  onSubmit: (values: FlashcardValues) => Promise<void>;
};

export function FlashcardFormModal({
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  isPending,
  initialValues,
  onSubmit,
}: FlashcardFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FlashcardFormValues>({
    resolver: zodResolver(flashcardFormSchema),
    defaultValues: getDefaultValues(initialValues),
  });

  useEffect(() => {
    reset(getDefaultValues(initialValues));
  }, [initialValues, open, reset]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      reset(getDefaultValues(initialValues));
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg gap-0 p-0 sm:max-w-lg">
      <form
        className="flex flex-col"
        onSubmit={handleSubmit(async (values) => {
          await onSubmit({
            ...values,
            type: initialValues?.type ?? "simple",
          });
        })}
      >
        <div className="flex flex-col gap-6 p-6 sm:p-8">
          <DialogHeader className="pr-8">
            <DialogTitle className="font-display text-2xl font-bold tracking-tight">
              {title}
            </DialogTitle>
            <DialogDescription className="max-w-xl text-sm leading-6">
              {description}
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <Field data-invalid={errors.question ? true : undefined}>
              <FieldLabel
                htmlFor="flashcard-question"
                className="text-[10px] uppercase tracking-[0.2em]"
              >
                Prompt / Question
              </FieldLabel>
              <FieldContent>
                <Textarea
                  id="flashcard-question"
                  placeholder="e.g. What is the Big O complexity of quicksort in the worst case?"
                  rows={3}
                  aria-invalid={errors.question ? true : undefined}
                  className="font-medium"
                  {...register("question")}
                />
                <FieldError
                  errors={errors.question ? [errors.question] : undefined}
                />
              </FieldContent>
            </Field>

            <Field data-invalid={errors.answer ? true : undefined}>
              <FieldLabel
                htmlFor="flashcard-answer"
                className="text-[10px] uppercase tracking-[0.2em]"
              >
                Resolution / Answer
              </FieldLabel>
              <FieldContent>
                <Textarea
                  id="flashcard-answer"
                  placeholder="e.g. O(n²) when the pivot is consistently the smallest or largest element."
                  rows={5}
                  aria-invalid={errors.answer ? true : undefined}
                  className="font-medium"
                  {...register("answer")}
                />
                <FieldError errors={errors.answer ? [errors.answer] : undefined} />
              </FieldContent>
            </Field>
          </FieldGroup>
        </div>

        <DialogFooter className="border-t border-border/60 px-6 py-4 sm:px-8">
          <Button
            type="button"
            variant="ghost"
            onClick={() => handleOpenChange(false)}
            className="font-bold"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending || isSubmitting}
            className="px-8 shadow-[0_8px_24px_oklch(0.52_0.26_258_/_0.2)]"
          >
            {isPending ? "Updating Trace..." : submitLabel}
          </Button>
        </DialogFooter>
      </form>
      </DialogContent>
    </Dialog>
  );
}
