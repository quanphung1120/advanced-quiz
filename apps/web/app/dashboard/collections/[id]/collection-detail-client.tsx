"use client";

import * as React from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  Edit,
  Play,
  SparklesIcon,
  LayersIcon,
} from "lucide-react";

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

// Kahoot-style color palette
const KAHOOT_COLORS = [
  { bg: "from-[#e21b3c] to-[#c41230]", accent: "#e21b3c" },
  { bg: "from-[#1368ce] to-[#0d52a6]", accent: "#1368ce" },
  { bg: "from-[#d89e00] to-[#b88400]", accent: "#d89e00" },
  { bg: "from-[#26890c] to-[#1e6b09]", accent: "#26890c" },
  { bg: "from-[#9c27b0] to-[#7b1fa2]", accent: "#9c27b0" },
  { bg: "from-[#00bcd4] to-[#0097a7]", accent: "#00bcd4" },
];

function getColorFromId(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return KAHOOT_COLORS[Math.abs(hash) % KAHOOT_COLORS.length];
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
  const color = getColorFromId(collection.id);

  return (
    <div className="container mx-auto max-w-4xl space-y-8 px-4 py-8">
      {/* Hero Header with Gradient Banner */}
      <div>
        <div className="overflow-hidden rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm">
          {/* Gradient Banner */}
          <div className={`relative h-24 bg-linear-to-br ${color.bg}`}>
            {/* Decorative shapes */}
            <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10" />
            <div className="absolute -bottom-6 -left-6 h-16 w-16 rounded-full bg-black/10" />
            <div className="absolute bottom-3 right-3 h-10 w-10 rotate-12 rounded-lg bg-white/10" />

            {/* Icon */}
            <div className="absolute left-6 top-1/2 -translate-y-1/2">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <LayersIcon className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-2xl tracking-tight md:text-3xl">
                    {collection.name}
                  </h1>
                  <SparklesIcon className="h-5 w-5 text-primary" />
                </div>
                {collection.description && (
                  <p className="max-w-2xl leading-relaxed text-muted-foreground">
                    {collection.description}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {canEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="transition-all hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
                  >
                    <Edit className="size-4" />
                    Edit
                  </Button>
                )}
                {flashcards.length > 0 && (
                  <Button
                    asChild
                    size="sm"
                    className="gap-1.5 shadow-lg transition-all hover:shadow-xl"
                    style={{ backgroundColor: color.accent }}
                  >
                    <Link href={`/learn/${collection.id}`} prefetch={false}>
                      <Play className="size-4" />
                      Start Learning
                    </Link>
                  </Button>
                )}
              </div>
            </div>

            {/* Metadata Pills */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-3 py-1.5 text-xs text-muted-foreground">
                <Calendar className="size-3" />
                Created {format(new Date(collection.created_at), "MMM d, yyyy")}
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-3 py-1.5 text-xs text-muted-foreground">
                <Clock className="size-3" />
                Updated {format(new Date(collection.updated_at), "MMM d, yyyy")}
              </span>
              <span className="rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary">
                {flashcards.length} flashcards
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Collaborators Section */}
      <div>
        <CollaboratorsSection
          collectionId={collection.id}
          collaborators={collection.collaborators || []}
          isOwner={isOwner}
        />
      </div>

      {/* Flashcards Preview Section */}
      <div>
        <FlashcardsPreview
          flashcards={flashcards}
          canEdit={canEdit}
          onAddCard={() => setIsCreatingCard(true)}
        />
      </div>

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
