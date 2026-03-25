import { Library, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@advanced-quiz/ui/components/button";
import type { Flashcard } from "@/features/flashcards/types/flashcard";

type FlashcardStackProps = {
  flashcards: Flashcard[];
  canEdit: boolean;
  onCreate: () => void;
  onEdit: (card: Flashcard) => void;
  onDelete: (card: Flashcard) => void;
};

export function FlashcardStack({
  flashcards,
  canEdit,
  onCreate,
  onEdit,
  onDelete,
}: FlashcardStackProps) {
  if (flashcards.length === 0) {
    return (
      <div className="rounded-sm border border-dashed border-border bg-muted/20 px-6 py-20 text-center space-y-5">
        <div className="flex justify-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-muted/30 border border-border">
            <Library className="h-5 w-5 text-muted-foreground/60" />
          </div>
        </div>
        <div className="space-y-1.5 max-w-sm mx-auto">
          <h3 className="text-sm font-semibold text-foreground">
            No cards yet
          </h3>
          <p className="text-[12px] leading-6 text-muted-foreground">
            Add your first flashcard to get started.
          </p>
        </div>
        {canEdit && (
          <Button onClick={onCreate} className="gap-2">
            <Plus className="h-3.5 w-3.5" />
            Add First Card
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-primary/70">
            Content
          </p>
          <h3 className="font-display text-xl font-bold tracking-tight text-foreground">
            Cards
          </h3>
        </div>
        <span className="rounded-sm border border-border bg-muted/30 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          {flashcards.length} cards
        </span>
      </div>

      {/* Card list */}
      <div className="rounded-sm border border-border divide-y divide-border">
        {flashcards.map((card, index) => (
          <div
            key={card.id}
            className="group relative flex gap-4 px-4 py-4 transition-colors hover:bg-accent/40"
          >
            {/* Index number */}
            <div className="shrink-0 flex h-6 w-6 items-center justify-center mt-0.5">
              <span className="text-[10px] font-bold tabular-nums text-muted-foreground/40">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-2.5">
              <div className="space-y-1">
                <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-muted-foreground/50">
                  Question
                </p>
                <p className="text-[13px] font-medium leading-6 text-foreground">
                  {card.question}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-muted-foreground/50">
                  Answer
                </p>
                <p className="text-[12px] leading-5 text-muted-foreground">
                  {card.answer}
                </p>
              </div>
            </div>

            {/* Actions */}
            {canEdit && (
              <div className="shrink-0 flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => onEdit(card)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  <span className="sr-only">Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(card)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="sr-only">Delete</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add card footer */}
      {canEdit && (
        <button
          type="button"
          onClick={onCreate}
          className="flex w-full items-center gap-2 rounded-sm border border-dashed border-border px-4 py-3 text-[12px] font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
        >
          <Plus className="h-3.5 w-3.5" />
          Add another card
        </button>
      )}
    </div>
  );
}
