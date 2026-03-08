import { Layers3, Plus, Search } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

type CollectionEmptyStateProps = {
  hasSearch: boolean;
  onCreate: () => void;
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function CollectionEmptyState({
  hasSearch,
  onCreate,
}: CollectionEmptyStateProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/40 px-6 py-20 text-center"
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary shadow-[0_0_40px_oklch(0.52_0.26_258_/_0.15)]">
        {hasSearch ? (
          <Search className="h-8 w-8" />
        ) : (
          <Layers3 className="h-8 w-8" />
        )}
      </div>

      <div className="mt-8 space-y-3 max-w-sm">
        <h3 className="font-display text-3xl font-black tracking-tight text-foreground">
          {hasSearch ? "No matches found" : "Collection empty"}
        </h3>
        <p className="text-sm leading-7 text-muted-foreground font-medium">
          {hasSearch
            ? "We couldn't find any collections matching your criteria. Try adjusting your search query."
            : "You haven't created any study collections yet. Start by building your first knowledge deck."}
        </p>
      </div>

      {!hasSearch && (
        <Button
          onClick={onCreate}
          size="lg"
          className="mt-10 gap-2 shadow-[0_8px_32px_oklch(0.52_0.26_258_/_0.2)]"
        >
          <Plus className="h-4 w-4" />
          Create Collection
        </Button>
      )}
    </motion.div>
  );
}
