import { FolderPlusIcon, SparklesIcon } from "lucide-react";

import { CreateCollectionDialog } from "./create-collection-dialog";

export function CollectionEmptyState() {
  return (
    <div className="rounded-2xl border border-border/50 bg-card/50 p-8 backdrop-blur-sm md:p-12">
      <div className="flex flex-col items-center text-center">
        {/* Icon Container */}
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br from-primary/20 to-primary/5 shadow-lg shadow-primary/10">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
            <FolderPlusIcon className="h-6 w-6" />
          </div>
        </div>

        {/* Content */}
        <div className="mb-2 flex items-center gap-2">
          <h3 className="font-display text-2xl tracking-tight">
            No collections yet
          </h3>
          <SparklesIcon className="h-5 w-5 text-primary" />
        </div>
        <p className="mb-6 max-w-sm text-muted-foreground">
          Create your first collection to start organizing your flashcards and
          master new topics with spaced repetition.
        </p>

        {/* Feature Pills */}
        <div className="mb-6 flex flex-wrap justify-center gap-2">
          <span className="rounded-full border border-border bg-background/80 px-3 py-1.5 text-xs font-medium text-muted-foreground">
            ✓ Organize by topic
          </span>
          <span className="rounded-full border border-border bg-background/80 px-3 py-1.5 text-xs font-medium text-muted-foreground">
            ✓ Add flashcards
          </span>
          <span className="rounded-full border border-border bg-background/80 px-3 py-1.5 text-xs font-medium text-muted-foreground">
            ✓ Study & review
          </span>
        </div>

        <CreateCollectionDialog />
      </div>
    </div>
  );
}
