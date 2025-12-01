"use client";

import * as React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Calendar, Clock, Edit, Play, Plus, User, Users } from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Collection, CollectionCollaborator } from "@/types/collection";
import { Flashcard } from "@/types/flashcard";
import { EditCollectionForm } from "@/features/collections/components/edit-collection-form";
import { UpdateCollectionFormData } from "@/features/collections/schemas";

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
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const canEdit = role === "owner" || role === "editor";

  const handleUpdateCollection = async (data: UpdateCollectionFormData) => {
    setIsSubmitting(true);
    try {
      // TODO: Integrate with real API
      // await updateCollection(collection.id, data);
      console.log("Update collection:", data);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update collection:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEditing) {
    return (
      <div className="container max-w-2xl mx-auto py-8 px-4">
        <EditCollectionForm
          collection={collection}
          onSubmit={handleUpdateCollection}
          onCancel={() => setIsEditing(false)}
          isSubmitting={isSubmitting}
        />
      </div>
    );
  }

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
                <Link href={`/learn/${collection.id}`}>
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
      <CollaboratorsSection collaborators={collection.collaborators || []} />

      {/* Flashcards Preview Section */}
      <FlashcardsPreview flashcards={flashcards} canEdit={canEdit} />
    </div>
  );
}

interface CollaboratorsSectionProps {
  collaborators: CollectionCollaborator[];
}

function CollaboratorsSection({ collaborators }: CollaboratorsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="size-4" />
          Collaborators
        </CardTitle>
        <CardDescription>
          People who have access to this collection
        </CardDescription>
        <CardAction>
          <Button variant="outline" size="sm" disabled>
            <Plus className="size-4" />
            Add Collaborator
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {collaborators.length === 0 ? (
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="flex items-center justify-center size-10 rounded-full bg-muted">
              <User className="size-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-foreground">
                No collaborators yet
              </p>
              <p className="text-sm">
                Add collaborators to share this collection with others.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {collaborators.map((collaborator) => (
              <CollaboratorChip
                key={collaborator.id}
                collaborator={collaborator}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface CollaboratorChipProps {
  collaborator: CollectionCollaborator;
}

function CollaboratorChip({ collaborator }: CollaboratorChipProps) {
  const roleColors = {
    admin: "bg-primary/10 text-primary border-primary/20",
    editor:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    viewer: "bg-muted text-muted-foreground border-border",
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-background">
      <Avatar className="size-6">
        <AvatarImage src={undefined} />
        <AvatarFallback className="text-xs">
          {collaborator.user_id.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <span className="text-sm font-medium">
        {/* TODO: Fetch user name from Clerk */}
        User {collaborator.user_id.slice(-4)}
      </span>
      <Badge
        variant="outline"
        className={cn("text-xs capitalize", roleColors[collaborator.role])}
      >
        {collaborator.role}
      </Badge>
    </div>
  );
}

interface FlashcardsPreviewProps {
  flashcards: Flashcard[];
  canEdit: boolean;
}

function FlashcardsPreview({ flashcards, canEdit }: FlashcardsPreviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Flashcards</CardTitle>
        <CardDescription>Preview and manage your flashcards</CardDescription>
        {canEdit && (
          <CardAction>
            <Button variant="outline" size="sm">
              <Plus className="size-4" />
              Add Card
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        {flashcards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex items-center justify-center size-12 rounded-full bg-muted mb-4">
              <Plus className="size-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-1">No flashcards yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Add your first flashcard to start building this collection.
            </p>
            {canEdit && (
              <Button variant="outline" size="sm" className="mt-4">
                <Plus className="size-4" />
                Add Your First Card
              </Button>
            )}
          </div>
        ) : (
          <div className="px-12">
            <Carousel
              opts={{
                align: "start",
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {flashcards.map((flashcard, index) => (
                  <CarouselItem
                    key={flashcard.id}
                    className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
                  >
                    <FlashcardPreviewCard flashcard={flashcard} index={index} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface FlashcardPreviewCardProps {
  flashcard: Flashcard;
  index: number;
}

function FlashcardPreviewCard({ flashcard, index }: FlashcardPreviewCardProps) {
  return (
    <Card className="h-48 flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-medium">
            #{index + 1}
          </span>
          <Badge variant="outline" className="text-xs capitalize">
            {flashcard.type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-3 overflow-hidden">
        <div className="space-y-1">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Q
          </span>
          <p className="text-sm line-clamp-2">{flashcard.question}</p>
        </div>
        <div className="space-y-1">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            A
          </span>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {flashcard.answer}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
