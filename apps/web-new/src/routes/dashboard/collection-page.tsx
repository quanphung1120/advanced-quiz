import { startTransition, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  Globe2,
  LockKeyhole,
  Orbit,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  Users2,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { CollaboratorsPanel } from "@/features/collections/components/collaborators-panel";
import { CollectionFormModal } from "@/features/collections/components/collection-form-modal";
import {
  useCollection,
  useDeleteCollection,
  useUpdateCollection,
} from "@/features/collections/hooks/use-collections";
import { FlashcardStack } from "@/features/flashcards/components/flashcard-stack";
import { FlashcardFormModal } from "@/features/flashcards/components/flashcard-form-modal";
import { Button } from "@/components/ui/button";
import type { Flashcard } from "@/features/flashcards/api/flashcards-api";
import {
  useCreateFlashcard,
  useDeleteFlashcard,
  useFlashcards,
  useUpdateFlashcard,
} from "@/features/flashcards/hooks/use-flashcards";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function CollectionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditCollectionOpen, setIsEditCollectionOpen] = useState(false);
  const [isCreateCardOpen, setIsCreateCardOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);

  const collectionQuery = useCollection(id ?? "");
  const flashcardsQuery = useFlashcards(id ?? "");
  const updateCollection = useUpdateCollection();
  const deleteCollection = useDeleteCollection();
  const createFlashcard = useCreateFlashcard();
  const updateFlashcard = useUpdateFlashcard();
  const deleteFlashcard = useDeleteFlashcard();

  const collectionData = collectionQuery.data;
  const collection = collectionData?.collection;
  const role = collectionData?.role;
  const flashcards = flashcardsQuery.data?.flashcards ?? [];
  const cardCount = flashcards.length;
  const canEdit = role === "owner" || role === "editor" || role === "admin";
  const canManageCollaborators = role === "owner" || role === "admin";

  const readinessLabel = useMemo(() => {
    if (cardCount === 0) {
      return "Waiting for cards";
    }

    if (cardCount < 5) {
      return "Getting warm";
    }

    return "Study-ready";
  }, [cardCount]);

  if (!id) {
    return null;
  }

  if (collectionQuery.isPending || flashcardsQuery.isPending) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-64 rounded-xl bg-muted/30 border border-border" />
        <div className="h-96 rounded-xl bg-muted/30 border border-border" />
      </div>
    );
  }

  if (!collection || !role) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="rounded-xl border border-dashed border-border bg-card/60 px-6 py-20 text-center space-y-6 max-w-2xl mx-auto"
      >
        <div className="space-y-4">
          <h2 className="font-display text-4xl font-black tracking-tight">
            Collection not found
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            This deck either does not exist or you no longer have access to it.
            It might have been deleted or its visibility changed.
          </p>
        </div>
        <Link to="/dashboard" className="inline-block">
          <Button variant="primary" size="lg" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Button>
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="space-y-10">
      <motion.section
        className="grid gap-6 xl:grid-cols-[1fr_340px]"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      >
        <motion.div
          variants={fadeUp}
          className="overflow-hidden rounded-xl border border-border bg-card/80 p-6 sm:p-10 shadow-[0_32px_80px_-20px_rgba(0,0,0,0.5)] relative group"
        >
          <div className="relative z-10 flex flex-col gap-8">
            <div className="space-y-6">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary group/back"
              >
                <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover/back:-translate-x-0.5" />
                Workspace
              </Link>

              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md border border-primary/20 bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                    {readinessLabel}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {collection.isPublic ? (
                      <Globe2 className="h-3.5 w-3.5" />
                    ) : (
                      <LockKeyhole className="h-3.5 w-3.5" />
                    )}
                    {collection.isPublic ? "Public" : "Private"}
                  </span>
                  <span className="rounded-md border border-border bg-muted/40 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {role} role
                  </span>
                </div>

                <h2 className="font-display text-5xl font-black tracking-tight text-foreground sm:text-6xl max-w-3xl">
                  {collection.name}
                </h2>
                <p className="max-w-2xl text-base leading-8 text-muted-foreground/90 font-medium">
                  {collection.description ||
                    "Define the scope of this deck to help collaborators understand its goal."}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-6 pt-4">
              <div className="flex flex-wrap gap-3">
                <Link to={`/learn/${collection.id}`} className="inline-block">
                  <Button size="lg" className="gap-2 group/btn">
                    Start Learning
                    <ChevronRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
                  </Button>
                </Link>
                {canEdit && (
                  <Button
                    variant="outline"
                    size="lg"
                    className="gap-2"
                    onClick={() => setIsCreateCardOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Add Flashcard
                  </Button>
                )}
              </div>

              {canEdit && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 h-10"
                    onClick={() => setIsEditCollectionOpen(true)}
                  >
                    <Pencil className="h-4 w-4" />
                    Edit Deck
                  </Button>
                </div>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-3 pt-4 border-t border-border/60">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
                  Total Cards
                </p>
                <p className="text-3xl font-display font-black text-foreground">
                  {cardCount}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
                  Study Progress
                </p>
                <p className="text-xl font-bold text-foreground">Ready Pulse</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
                  Visibility
                </p>
                <p className="text-xl font-bold text-foreground">
                  {collection.isPublic ? "Open Access" : "Restricted"}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="space-y-6">
          <motion.div
            variants={fadeUp}
            className="rounded-xl border border-border bg-card/60 p-6 shadow-lg backdrop-blur-xl"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">
              Control Panel
            </p>
            <div className="mt-5 space-y-2.5">
              <Link
                to={`/learn/${collection.id}/srs`}
                className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-4 py-3.5 text-sm font-bold transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary group"
              >
                Deep Knowledge Review
                <Orbit className="h-4 w-4 transition-transform group-hover:rotate-12" />
              </Link>

              {role === "owner" && (
                <button
                  type="button"
                  onClick={async () => {
                    const confirmed = window.confirm(
                      `Permanently delete "${collection.name}"? All cards will be lost.`,
                    );

                    if (!confirmed) return;

                    await deleteCollection.mutateAsync(collection.id);
                    startTransition(() => {
                      navigate("/dashboard");
                    });
                  }}
                  className="w-full flex items-center gap-3 rounded-lg border border-destructive/20 px-4 py-3.5 text-sm font-bold text-destructive/80 transition-all hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Destroy collection
                </button>
              )}
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="rounded-xl border border-border bg-card/60 p-6 shadow-lg backdrop-blur-xl"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
              Permissions
            </p>
            <div className="mt-5 space-y-4">
              <div className="flex gap-4">
                <div className="mt-0.5 shrink-0 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold">Role-based Access</p>
                  <p className="text-xs leading-5 text-muted-foreground font-medium">
                    {canEdit
                      ? "You have full editing permissions for this collection."
                      : "You have view-only access to this collection."}
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="mt-0.5 shrink-0 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                  <Users2 className="h-4 w-4 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold">Collaborators</p>
                  <p className="text-xs leading-5 text-muted-foreground font-medium">
                    {canManageCollaborators
                      ? "You can invite others and modify participant roles."
                      : "Attendee list is visible but roles are locked."}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <CollaboratorsPanel
        canManage={canManageCollaborators}
        collectionId={collection.id}
        collaborators={collection.collaborators ?? []}
      />

      <FlashcardStack
        flashcards={flashcards}
        canEdit={canEdit}
        onCreate={() => setIsCreateCardOpen(true)}
        onEdit={(card) => setEditingCard(card)}
        onDelete={async (card) => {
          const confirmed = window.confirm(
            "Permanently delete this flashcard?",
          );
          if (!confirmed) return;

          await deleteFlashcard.mutateAsync({
            collectionId: collection.id,
            id: card.id,
          });
        }}
      />

      <CollectionFormModal
        key={`${collection.id}-collection-edit-${isEditCollectionOpen ? "open" : "closed"}`}
        open={isEditCollectionOpen}
        onOpenChange={setIsEditCollectionOpen}
        title="Settings & Privacy"
        description="Modify the deck details and visibility settings. Keep descriptors concise."
        submitLabel="Apply Changes"
        initialValues={{
          name: collection.name,
          description: collection.description ?? undefined,
          isPublic: collection.isPublic,
        }}
        isPending={updateCollection.isPending}
        onSubmit={async (values) => {
          await updateCollection.mutateAsync({
            id: collection.id,
            data: values,
          });
          setIsEditCollectionOpen(false);
        }}
      />

      <FlashcardFormModal
        key={`${collection.id}-flashcard-create-${isCreateCardOpen ? "open" : "closed"}`}
        open={isCreateCardOpen}
        onOpenChange={setIsCreateCardOpen}
        title="Add Knowledge Point"
        description="Craft a clear prompt/question and a concise answer for optimal retention."
        submitLabel="Create Card"
        isPending={createFlashcard.isPending}
        onSubmit={async (values) => {
          await createFlashcard.mutateAsync({
            collectionId: collection.id,
            data: {
              question: values.question,
              answer: values.answer,
              type: values.type,
            },
          });
          setIsCreateCardOpen(false);
        }}
      />

      <FlashcardFormModal
        key={editingCard?.id ?? "flashcard-edit-empty"}
        open={Boolean(editingCard)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingCard(null);
          }
        }}
        title="Refine Flashcard"
        description="Edit the content to clarify the concept. Aim for single-topic focus."
        submitLabel="Update Knowledge"
        initialValues={
          editingCard
            ? {
                question: editingCard.question,
                answer: editingCard.answer,
                type: editingCard.type,
              }
            : undefined
        }
        isPending={updateFlashcard.isPending}
        onSubmit={async (values) => {
          if (!editingCard) return;

          await updateFlashcard.mutateAsync({
            collectionId: collection.id,
            id: editingCard.id,
            data: {
              question: values.question,
              answer: values.answer,
              type: values.type,
            },
          });
          setEditingCard(null);
        }}
      />
    </div>
  );
}
