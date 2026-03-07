import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

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
        <div className="space-y-2">
          <label
            htmlFor="flashcard-question"
            className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1"
          >
            Prompt / Question
          </label>
          <textarea
            id="flashcard-question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="e.g. What is the Big O complexity of quicksort in the worst case?"
            required
            rows={3}
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition-all placeholder:text-muted-foreground/50 focus:border-primary/60 focus:bg-primary/5 font-medium resize-none"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="flashcard-answer"
            className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1"
          >
            Resolution / Answer
          </label>
          <textarea
            id="flashcard-answer"
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            placeholder="e.g. O(n²) when the pivot is consistently the smallest or largest element."
            required
            rows={5}
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition-all placeholder:text-muted-foreground/50 focus:border-primary/60 focus:bg-primary/5 font-medium resize-none"
          />
        </div>

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
