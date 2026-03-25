import { startTransition, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  ChevronRight,
  Globe2,
  LockKeyhole,
  Orbit,
  Pencil,
  Plus,
} from "lucide-react";
import { Button } from "@advanced-quiz/ui/components/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@advanced-quiz/ui/components/tabs";
import { LoadingState } from "@/components/loading-state";
import { CollectionFormModal } from "@/features/collections/components/collection-form-modal";
import { CollaboratorsPanel } from "@/features/collections/components/collaborators-panel";
import { DeleteDeckDialog } from "@/features/collections/components/delete-deck-dialog";
import {
  useCollection,
  useDeleteCollection,
  useUpdateCollection,
} from "@/features/collections/hooks/use-collections";
import { FlashcardStack } from "@/features/flashcards/components/flashcard-stack";
import { FlashcardFormModal } from "@/features/flashcards/components/flashcard-form-modal";
import {
  useCreateFlashcard,
  useDeleteFlashcard,
  useFlashcards,
  useUpdateFlashcard,
} from "@/features/flashcards/hooks/use-flashcards";
import type { Flashcard } from "@/features/flashcards/types/flashcard";

export function CollectionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditCollectionOpen, setIsEditCollectionOpen] = useState(false);
  const [isCreateCardOpen, setIsCreateCardOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const [isDeleteDeckOpen, setIsDeleteDeckOpen] = useState(false);

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
  const canManage = role === "owner" || role === "admin";

  const readinessLabel =
    cardCount === 0 ? "No cards" : cardCount < 5 ? "Almost ready" : "Ready";

  if (!id) return null;

  if (collectionQuery.isPending || flashcardsQuery.isPending) {
    return <LoadingState />;
  }

  if (!collection || !role) {
    return (
      <div className="rounded-sm border border-dashed border-border bg-card/60 px-6 py-20 text-center space-y-6 max-w-2xl mx-auto">
        <div className="space-y-3">
          <h2 className="font-display text-3xl font-bold tracking-tight">
            Collection not found
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This deck either does not exist or you no longer have access to it.
            It might have been deleted or its visibility changed.
          </p>
        </div>
        <Link to="/dashboard" className="inline-block">
          <Button size="lg" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-2">
        <Link
          to="/dashboard"
          className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
        >
          Workspace
        </Link>
        <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground">
          Collection
        </span>
      </div>

      {/* ── Collection header ── */}
      <div className="space-y-6">
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-sm border border-primary/20 bg-primary/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.3em] text-primary">
            {readinessLabel}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-muted/30 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            {collection.isPublic ? (
              <Globe2 className="h-3 w-3" />
            ) : (
              <LockKeyhole className="h-3 w-3" />
            )}
            {collection.isPublic ? "Public" : "Private"}
          </span>
          <span className="rounded-sm border border-border bg-muted/30 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            {role}
          </span>
        </div>

        {/* Title + description */}
        <div className="space-y-3">
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            {collection.name}
          </h1>
          <p className="max-w-xl text-sm leading-7 text-muted-foreground font-medium">
            {collection.description ||
              "Add a description to explain what this deck is about."}
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-border" />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 sm:max-w-sm">
          <div className="space-y-1">
            <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-muted-foreground/60">
              Total Cards
            </p>
            <p className="font-display text-3xl font-bold text-foreground">
              {cardCount}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-muted-foreground/60">
              Visibility
            </p>
            <p className="text-sm font-semibold text-foreground">
              {collection.isPublic ? "Open" : "Private"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-muted-foreground/60">
              Your Role
            </p>
            <p className="text-sm font-semibold text-foreground capitalize">
              {role}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border" />

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2.5">
            <Link to={`/learn/${collection.id}`}>
              <Button className="gap-2">
                Start Learning
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
            {canEdit && (
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setIsCreateCardOpen(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                Add Card
              </Button>
            )}
          </div>

          {canEdit && (
            <button
              type="button"
              onClick={() => setIsEditCollectionOpen(true)}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
            >
              <Pencil className="h-3 w-3" />
              Edit Deck
            </button>
          )}
        </div>
      </div>

      {/* ── Tabs ── */}
      <Tabs defaultValue="overview" className="flex flex-col gap-8">
        <TabsList
          variant="line"
          className="w-full justify-start border-b border-border"
        >
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview tab — flashcards */}
        <TabsContent value="overview">
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
        </TabsContent>

        {/* Settings tab — collaborators, study, danger zone */}
        <TabsContent value="settings" className="flex flex-col gap-8">
          {/* Collaborators */}
          <CollaboratorsPanel
            canManage={canManage}
            collectionId={collection.id}
            collaborators={collection.collaborators ?? []}
          />

          <div className="h-px bg-border" />

          {/* Study */}
          <div className="space-y-3">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-muted-foreground/60">
                Study
              </p>
            </div>
            <div className="rounded-sm border border-border divide-y divide-border">
              <Link
                to={`/learn/${collection.id}/srs`}
                className="flex items-center justify-between px-4 py-3 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground group"
              >
                Spaced Repetition
                <Orbit className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:rotate-12" />
              </Link>
              <Link
                to={`/learn/${collection.id}`}
                className="flex items-center justify-between px-4 py-3 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground group"
              >
                Quick Study
                <ChevronRight className="h-3.5 w-3.5 shrink-0" />
              </Link>
            </div>
          </div>

          {/* Danger zone */}
          {role === "owner" && (
            <div className="space-y-3">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-destructive/60">
                  Danger Zone
                </p>
              </div>
              <div className="rounded-sm border border-destructive/20 divide-y divide-destructive/10">
                <div className="flex items-center justify-between gap-4 px-4 py-3.5">
                  <div className="space-y-0.5">
                    <p className="text-[13px] font-medium text-foreground">
                      Delete deck
                    </p>
                    <p className="text-[11px] leading-5 text-muted-foreground">
                      This will delete the deck and all its cards. You can't
                      undo this.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsDeleteDeckOpen(true)}
                    className="shrink-0 inline-flex items-center gap-1.5 rounded-sm border border-destructive/30 bg-destructive/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-destructive transition-colors hover:bg-destructive/10"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ── Delete Deck Dialog ── */}
      <DeleteDeckDialog
        open={isDeleteDeckOpen}
        onOpenChange={setIsDeleteDeckOpen}
        deckName={collection.name}
        isPending={deleteCollection.isPending}
        onConfirm={async () => {
          await deleteCollection.mutateAsync(collection.id);
          startTransition(() => {
            navigate("/dashboard");
          });
        }}
      />

      {/* ── Modals ── */}
      <CollectionFormModal
        key={`${collection.id}-collection-edit-${isEditCollectionOpen ? "open" : "closed"}`}
        open={isEditCollectionOpen}
        onOpenChange={setIsEditCollectionOpen}
        title="Deck Settings"
        description="Change name, description, or who can see this deck."
        submitLabel="Save"
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
        title="Add Flashcard"
        description="Write a question and its answer."
        submitLabel="Add Card"
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
          if (!open) setEditingCard(null);
        }}
        title="Edit Flashcard"
        description="Change the question or answer."
        submitLabel="Save Changes"
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
