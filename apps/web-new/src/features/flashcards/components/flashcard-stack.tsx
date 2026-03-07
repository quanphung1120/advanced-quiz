import { Library, Pencil, Plus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { Flashcard } from "@/features/flashcards/api/flashcards-api";

type FlashcardStackProps = {
  flashcards: Flashcard[];
  canEdit: boolean;
  onCreate: () => void;
  onEdit: (card: Flashcard) => void;
  onDelete: (card: Flashcard) => void;
};

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
  },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-dashed border-border bg-card/40 px-6 py-24 text-center space-y-6"
      >
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/20 border border-border">
            <Library className="h-8 w-8 text-muted-foreground/60" />
          </div>
        </div>
        <div className="space-y-2 max-w-sm mx-auto">
          <h3 className="font-display text-2xl font-black tracking-tight">
            Empty Knowledge Base
          </h3>
          <p className="text-sm text-muted-foreground font-medium leading-relaxed">
            This collection has no cards yet. Knowledge points are the building
            blocks of deep learning.
          </p>
        </div>
        {canEdit && (
          <Button
            onClick={onCreate}
            size="lg"
            className="gap-2 shadow-[0_8px_32px_oklch(0.52_0.26_258_/_0.2)]"
          >
            <Plus className="h-4 w-4" />
            Create First Card
          </Button>
        )}
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between px-1">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">
            Content
          </p>
          <h3 className="font-display text-3xl font-black tracking-tight">
            Flashcard Stack
          </h3>
        </div>
        <span className="rounded-md border border-border bg-muted/20 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {flashcards.length} Total Points
        </span>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="grid gap-4"
      >
        <AnimatePresence mode="popLayout">
          {flashcards.map((card) => (
            <motion.div
              layout
              key={card.id}
              variants={item}
              className="group relative rounded-xl border border-border bg-card/60 p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-[0_4px_24px_oklch(0.52_0.26_258_/_0.08)] backdrop-blur-sm overflow-hidden"
            >
              {/* Subtle hover accent */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="flex gap-6 relative z-10">
                <div className="flex-1 space-y-4">
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary/70">
                      Question
                    </p>
                    <p className="text-base font-bold leading-relaxed text-foreground tracking-tight">
                      {card.question}
                    </p>
                  </div>
                  <div className="space-y-1.5 pt-3 border-t border-border/40">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60">
                      Answer
                    </p>
                    <p className="text-sm font-medium leading-relaxed text-muted-foreground">
                      {card.answer}
                    </p>
                  </div>
                </div>

                {canEdit && (
                  <div className="shrink-0 flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-10 w-10 p-0 rounded-lg hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20"
                      onClick={() => onEdit(card)}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-10 w-10 p-0 rounded-lg hover:bg-destructive/10 hover:text-destructive border border-transparent hover:border-destructive/20"
                      onClick={() => onDelete(card)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                )}
              </div>

              {/* Interaction indicators */}
              <div className="mt-4 flex items-center gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/50">
                  Ready for review
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
