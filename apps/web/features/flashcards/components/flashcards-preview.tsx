"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Flashcard } from "@/types/flashcard";
import { FlashcardPreviewCard } from "./flashcard-preview-card";

interface FlashcardsPreviewProps {
  flashcards: Flashcard[];
  canEdit: boolean;
  onAddCard: () => void;
}

export function FlashcardsPreview({
  flashcards,
  canEdit,
  onAddCard,
}: FlashcardsPreviewProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Flashcards</h2>
          <p className="text-sm text-muted-foreground">
            Preview and manage your flashcards
          </p>
        </div>
        {canEdit && (
          <Button variant="outline" size="sm" onClick={onAddCard}>
            <Plus className="size-4" />
            Add Card
          </Button>
        )}
      </div>

      {flashcards.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex items-center justify-center size-12 rounded-full bg-muted mb-4">
              <Plus className="size-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-1">No flashcards yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Add your first flashcard to start building this collection.
            </p>
            {canEdit && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={onAddCard}
              >
                <Plus className="size-4" />
                Add Your First Card
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-1">
          {flashcards.map((flashcard, index) => (
            <FlashcardPreviewCard
              key={flashcard.id}
              flashcard={flashcard}
              index={index}
              canEdit={canEdit}
            />
          ))}
        </div>
      )}
    </section>
  );
}
