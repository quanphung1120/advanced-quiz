"use client";

import { Plus, User, Users } from "lucide-react";

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
import { CollectionCollaborator } from "@/types/collection";

interface CollaboratorsSectionProps {
  collaborators: CollectionCollaborator[];
}

export function CollaboratorsSection({
  collaborators,
}: CollaboratorsSectionProps) {
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
