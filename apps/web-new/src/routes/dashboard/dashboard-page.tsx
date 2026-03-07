import { useDeferredValue, useState } from "react";
import { Plus, Search } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { CollectionCard } from "@/features/collections/components/collection-card";
import { CollectionEmptyState } from "@/features/collections/components/collection-empty-state";
import { CollectionFormModal } from "@/features/collections/components/collection-form-modal";
import { Button } from "@/components/ui/button";
import {
  useCollections,
  useCreateCollection,
} from "@/features/collections/hooks/use-collections";

function matchesQuery(
  query: string,
  collection: { name: string; description: string | null },
) {
  if (!query) {
    return true;
  }

  const haystack = `${collection.name} ${collection.description ?? ""}`
    .trim()
    .toLowerCase();
  return haystack.includes(query);
}

const gridContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

const gridItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export function DashboardPage() {
  const [searchValue, setSearchValue] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const deferredSearch = useDeferredValue(searchValue.trim().toLowerCase());

  const collectionsQuery = useCollections();
  const createCollection = useCreateCollection();

  const ownedCollections = collectionsQuery.data?.ownedCollections ?? [];
  const sharedCollections = collectionsQuery.data?.sharedCollections ?? [];

  const filteredOwned = ownedCollections.filter((collection) =>
    matchesQuery(deferredSearch, collection),
  );
  const filteredShared = sharedCollections.filter((collection) =>
    matchesQuery(deferredSearch, collection),
  );
  const hasResults = filteredOwned.length > 0 || filteredShared.length > 0;

  return (
    <div className="space-y-10">
      {/* ── Page header ── */}
      <section className="mt-16 space-y-8">
        <motion.div
          className="flex flex-wrap items-end justify-between gap-6"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-primary">
              Workspace
            </p>
            <h1 className="font-display text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
              Collections
            </h1>
          </div>
          <Button
            onClick={() => setIsCreateOpen(true)}
            size="lg"
            className="gap-2 shadow-[0_8px_32px_oklch(0.88_0.28_111_/_0.3)]"
          >
            <Plus className="h-4 w-4" />
            New collection
          </Button>
        </motion.div>

        {/* Search */}
        <motion.label
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-8 flex items-center gap-3 rounded-sm border border-border bg-muted/50 px-4 py-3.5 transition-all focus-within:border-primary/40 focus-within:bg-muted/60 focus-within:shadow-[0_0_20px_oklch(0.88_0.28_111_/_0.1)] group"
        >
          <Search className="h-4 w-4 shrink-0 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Search collections by title or description…"
            className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground/60 text-foreground"
          />
        </motion.label>
      </section>

      {/* ── Collections grid ── */}
      {collectionsQuery.isPending ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-64 animate-pulse rounded-sm border border-border bg-muted/30"
            />
          ))}
        </div>
      ) : !hasResults ? (
        <CollectionEmptyState
          hasSearch={Boolean(deferredSearch)}
          onCreate={() => setIsCreateOpen(true)}
        />
      ) : (
        <div className="space-y-12">
          {filteredOwned.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-end justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-primary/70">
                    Your Decks
                  </p>
                  <h3 className="font-display text-3xl font-bold tracking-tight">
                    Owned Collections
                  </h3>
                </div>
                <span className="rounded-md border border-border bg-muted/20 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {filteredOwned.length} visible
                </span>
              </div>

              <motion.div
                className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
                variants={gridContainer}
                initial="hidden"
                animate="visible"
              >
                {filteredOwned.map((collection) => (
                  <motion.div key={collection.id} variants={gridItem}>
                    <CollectionCard collection={collection} />
                  </motion.div>
                ))}
              </motion.div>
            </section>
          )}

          {filteredOwned.length === 0 && deferredSearch && (
            <div className="rounded-sm border border-dashed border-border bg-muted/10 px-6 py-12 text-center text-sm font-medium text-muted-foreground">
              No owned collections match your search.
            </div>
          )}

          {filteredShared.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-end justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-primary/70">
                    External
                  </p>
                  <h3 className="font-display text-3xl font-bold tracking-tight">
                    Shared with you
                  </h3>
                </div>
                <span className="rounded-md border border-border bg-muted/20 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {filteredShared.length} visible
                </span>
              </div>

              <motion.div
                className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
                variants={gridContainer}
                initial="hidden"
                animate="visible"
              >
                {filteredShared.map((collection) => (
                  <motion.div key={collection.id} variants={gridItem}>
                    <CollectionCard collection={collection} />
                  </motion.div>
                ))}
              </motion.div>
            </section>
          )}

          {filteredShared.length === 0 && deferredSearch && (
            <div className="rounded-xl border border-dashed border-border bg-muted/10 px-6 py-12 text-center text-sm font-medium text-muted-foreground">
              No shared collections match your search.
            </div>
          )}
        </div>
      )}

      <CollectionFormModal
        key={`dashboard-create-${isCreateOpen ? "open" : "closed"}`}
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        title="Create Collection"
        description="Organise your knowledge into a focused deck. Start with a clear title and description."
        submitLabel="Create collection"
        isPending={createCollection.isPending}
        onSubmit={async (values) => {
          await createCollection.mutateAsync(values);
          setIsCreateOpen(false);
        }}
      />
    </div>
  );
}
