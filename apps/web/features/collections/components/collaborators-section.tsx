"use client";

import * as React from "react";
import { Plus, User, Users, X, Loader2 } from "lucide-react";

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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { CollectionCollaborator } from "../service/api";
import { removeCollaborator } from "../service/actions";
import { AddCollaboratorDialog } from "./add-collaborator-dialog";

interface CollaboratorsSectionProps {
  collectionId: string;
  collaborators: CollectionCollaborator[];
  isOwner: boolean;
}

export function CollaboratorsSection({
  collectionId,
  collaborators,
  isOwner,
}: CollaboratorsSectionProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);

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
        {isOwner && (
          <CardAction>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="size-4" />
              Add Collaborator
            </Button>
          </CardAction>
        )}
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
                {isOwner
                  ? "Add collaborators to share this collection with others."
                  : "This collection has no other collaborators."}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {collaborators.map((collaborator) => (
              <CollaboratorChip
                key={collaborator.id}
                collectionId={collectionId}
                collaborator={collaborator}
                canRemove={isOwner}
              />
            ))}
          </div>
        )}
      </CardContent>

      {isOwner && (
        <AddCollaboratorDialog
          collectionId={collectionId}
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
        />
      )}
    </Card>
  );
}

interface CollaboratorChipProps {
  collectionId: string;
  collaborator: CollectionCollaborator;
  canRemove: boolean;
}

function CollaboratorChip({
  collectionId,
  collaborator,
  canRemove,
}: CollaboratorChipProps) {
  const [isRemoving, setIsRemoving] = React.useState(false);

  const roleColors = {
    admin: "bg-primary/10 text-primary border-primary/20",
    editor:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    viewer: "bg-muted text-muted-foreground border-border",
  };

  const displayName =
    collaborator.email || `User ${collaborator.user_id.slice(-4)}`;
  const initials = collaborator.email
    ? collaborator.email.slice(0, 2).toUpperCase()
    : collaborator.user_id.slice(0, 2).toUpperCase();

  async function handleRemove() {
    setIsRemoving(true);
    try {
      await removeCollaborator(collectionId, collaborator.id);
    } finally {
      setIsRemoving(false);
    }
  }

  return (
    <div className="group flex items-center gap-2 px-3 py-1.5 rounded-full border bg-background transition-colors hover:bg-muted/50">
      <Avatar className="size-6">
        <AvatarImage src={undefined} />
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>
      <span className="text-sm font-medium truncate max-w-32">
        {displayName}
      </span>
      <Badge
        variant="outline"
        className={cn("text-xs capitalize", roleColors[collaborator.role])}
      >
        {collaborator.role}
      </Badge>

      {canRemove && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-5 -mr-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
              disabled={isRemoving}
            >
              {isRemoving ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <X className="size-3" />
              )}
              <span className="sr-only">Remove collaborator</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Collaborator</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove{" "}
                <span className="font-medium text-foreground">
                  {displayName}
                </span>{" "}
                from this collection? They will lose access to all flashcards.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRemove}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
