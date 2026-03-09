import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

type FlashcardValues = {
  question: string;
  answer: string;
  type: string;
};

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
  const [question, setQuestion] = useState(initialValues?.question ?? "");
  const [answer, setAnswer] = useState(initialValues?.answer ?? "");
  const [type] = useState(initialValues?.type ?? "default");

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
    >
      <form
        className="space-y-6"
        onSubmit={async (event) => {
          event.preventDefault();
          await onSubmit({
            question: question.trim(),
            answer: answer.trim(),
            type,
          });
        }}
      >
        <Field>
          <FieldLabel
            htmlFor="flashcard-question"
            className="ml-1 text-[10px] tracking-[0.2em]"
          >
            Prompt / Question
          </FieldLabel>
          <Textarea
            id="flashcard-question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="e.g. What is the Big O complexity of quicksort in the worst case?"
            required
            rows={3}
            className="font-medium"
          />
        </Field>

        <Field>
          <FieldLabel
            htmlFor="flashcard-answer"
            className="ml-1 text-[10px] tracking-[0.2em]"
          >
            Resolution / Answer
          </FieldLabel>
          <Textarea
            id="flashcard-answer"
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            placeholder="e.g. O(n²) when the pivot is consistently the smallest or largest element."
            required
            rows={5}
            className="font-medium"
          />
        </Field>

        <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-border/60">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="font-bold"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="px-8 shadow-[0_8px_24px_oklch(0.52_0.26_258_/_0.2)]"
          >
            {isPending ? "Updating Trace..." : submitLabel}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
