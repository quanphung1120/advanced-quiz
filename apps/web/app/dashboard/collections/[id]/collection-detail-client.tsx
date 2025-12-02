"use client";

import * as React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Calendar, Clock, Edit, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Collection } from "@/types/collection";
import { Flashcard } from "@/types/flashcard";
import { CollaboratorsSection } from "@/features/collections/components/collaborators-section";
import { EditCollectionDialog } from "@/features/collections/components/edit-collection-dialog";
import { CreateFlashcardForm } from "@/features/flashcards/components/create-flashcard-form";
import { FlashcardsPreview } from "@/features/flashcards/components/flashcards-preview";

interface CollectionDetailClientProps {
  collection: Collection;
  flashcards: Flashcard[];
  role: "owner" | "editor" | "viewer" | null;
}

export function CollectionDetailClient({
  collection,
  flashcards,
  role,
}: CollectionDetailClientProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [isCreatingCard, setIsCreatingCard] = React.useState(false);

  const canEdit = role === "owner" || role === "editor";
  const isOwner = role === "owner";

  // Dialogs are now rendered inline so the page remains visible while editing / creating

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 space-y-8">
      {/* Header Section */}
      <header className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-semibold tracking-tight">
              {collection.name}
            </h1>
            {collection.description && (
              <p className="text-muted-foreground leading-relaxed max-w-2xl">
                {collection.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {canEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="size-4" />
                Edit
              </Button>
            )}
            {flashcards.length > 0 && (
              <Button asChild size="sm">
                <Link href={`/learn/${collection.id}`} prefetch={false}>
                  <Play className="size-4" />
                  Start Learning
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="size-3.5" />
            <span>
              Created {format(new Date(collection.created_at), "MMM d, yyyy")}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="size-3.5" />
            <span>
              Updated {format(new Date(collection.updated_at), "MMM d, yyyy")}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-medium">{flashcards.length}</span>
            <span>flashcards</span>
          </div>
        </div>
      </header>

      {/* Collaborators Section */}
      <CollaboratorsSection
        collectionId={collection.id}
        collaborators={collection.collaborators || []}
        isOwner={isOwner}
      />

      {/* Flashcards Preview Section */}
      <FlashcardsPreview
        flashcards={flashcards}
        canEdit={canEdit}
        onAddCard={() => setIsCreatingCard(true)}
      />

      {/* Edit Collection - Dialog */}
      <EditCollectionDialog
        collection={collection}
        open={isEditing}
        onOpenChange={setIsEditing}
      />

      {/* Create Flashcard Dialog */}
      <Dialog open={isCreatingCard} onOpenChange={setIsCreatingCard}>
        <DialogContent className="sm:max-w-md">
          <CreateFlashcardForm
            collectionId={collection.id}
            onCancel={() => setIsCreatingCard(false)}
            inDialog={true}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
