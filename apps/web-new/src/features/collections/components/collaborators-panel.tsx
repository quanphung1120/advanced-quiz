import { useState } from "react";
import {
  Loader2,
  Plus,
  Shield,
  Trash2,
  UserPen,
  UserRound,
  Users,
} from "lucide-react";
import type { CollectionCollaborator } from "@/features/collections/api/collections-api";
import { useRemoveCollaborator } from "../hooks/use-collections";
import { AddCollaboratorModal } from "./add-collaborator-modal";
import { Button } from "@/components/ui/button";

type CollaboratorsPanelProps = {
  canManage: boolean;
  collectionId: string;
  collaborators: CollectionCollaborator[];
};

const ROLE_LABELS = {
  admin: { label: "Admin", icon: Shield },
  editor: { label: "Editor", icon: UserPen },
  viewer: { label: "Viewer", icon: UserRound },
};

export function CollaboratorsPanel({
  canManage,
  collectionId,
  collaborators,
}: CollaboratorsPanelProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const removeCollaborator = useRemoveCollaborator(collectionId);

  return (
    <section className="space-y-5">
      {/* Section header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-0.5">
          <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-primary/70">
            Network
          </p>
          <h3 className="font-display text-xl font-bold tracking-tight text-foreground">
            Shared Access
          </h3>
        </div>

        {canManage && (
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="outline"
            size="sm"
            className="gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            Invite Member
          </Button>
        )}
      </div>

      {/* Content */}
      {collaborators.length === 0 ? (
        <div className="rounded-sm border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-sm bg-primary/10 border border-primary/20 text-primary">
            <Users className="h-4 w-4" />
          </div>
          <div className="mt-4 space-y-1 max-w-sm mx-auto">
            <p className="text-sm font-semibold text-foreground">
              Isolated Deck
            </p>
            <p className="text-[12px] leading-6 text-muted-foreground">
              {canManage
                ? "Invite collaborators who should contribute to or study this collection."
                : "This deck is currently private to its owner."}
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-sm border border-border divide-y divide-border">
          {collaborators.map((collaborator) => {
            const roleInfo = ROLE_LABELS[collaborator.role];
            const RoleIcon = roleInfo.icon;

            return (
              <div
                key={collaborator.id}
                className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-accent/50 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="shrink-0 flex h-7 w-7 items-center justify-center rounded-sm bg-primary/10 border border-primary/20 text-primary">
                    <RoleIcon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-foreground truncate">
                      {collaborator.email ?? collaborator.userId}
                    </p>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/60">
                      Joined{" "}
                      {new Date(collaborator.createdAt).toLocaleDateString(
                        undefined,
                        { month: "short", day: "numeric", year: "numeric" },
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="rounded-sm border border-border bg-muted/30 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    {roleInfo.label}
                  </span>

                  {canManage && (
                    <button
                      type="button"
                      onClick={() => removeCollaborator.mutate(collaborator.id)}
                      disabled={removeCollaborator.isPending}
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-destructive/50 transition-colors hover:text-destructive disabled:opacity-40"
                    >
                      {removeCollaborator.isPending ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AddCollaboratorModal
        collectionId={collectionId}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </section>
  );
}
