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
import { motion } from "framer-motion";
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

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function CollaboratorsPanel({
  canManage,
  collectionId,
  collaborators,
}: CollaboratorsPanelProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const removeCollaborator = useRemoveCollaborator(collectionId);

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={fadeUp}
      className="rounded-xl border border-border bg-card/40 p-6 sm:p-8 shadow-lg backdrop-blur-xl relative overflow-hidden"
    >
      <div className="flex flex-wrap items-end justify-between gap-6 relative z-10">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">
            Network
          </p>
          <h3 className="font-display text-3xl font-black tracking-tight text-foreground">
            Shared Access
          </h3>
        </div>

        {canManage && (
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="outline"
            size="md"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Invite Member
          </Button>
        )}
      </div>

      {collaborators.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center relative z-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
            <Users className="h-6 w-6" />
          </div>
          <div className="mt-6 space-y-2 max-w-sm mx-auto">
            <p className="font-display text-2xl font-bold tracking-tight">
              Isolated Deck
            </p>
            <p className="text-sm leading-7 text-muted-foreground font-medium">
              {canManage
                ? "Invite collaborators who should actively contribute to or study this knowledge base."
                : "This deck is currently private to its owner."}
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-10 grid gap-4 md:grid-cols-2 relative z-10">
          {collaborators.map((collaborator) => {
            const roleInfo = ROLE_LABELS[collaborator.role];
            const RoleIcon = roleInfo.icon;

            return (
              <article
                key={collaborator.id}
                className="group rounded-xl border border-border bg-muted/30 p-5 transition-all hover:border-primary/30 hover:bg-muted/40"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="shrink-0 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary transition-transform group-hover:scale-105">
                      <RoleIcon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-foreground">
                        {collaborator.email ?? collaborator.userId}
                      </p>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60">
                        Joined{" "}
                        {new Date(collaborator.createdAt).toLocaleDateString(
                          undefined,
                          { month: "short", day: "numeric", year: "numeric" },
                        )}
                      </p>
                    </div>
                  </div>

                  <span className="rounded-md border border-border bg-muted/50 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-muted-foreground transition-colors group-hover:border-primary/20 group-hover:text-primary/70">
                    {roleInfo.label}
                  </span>
                </div>

                {canManage && (
                  <div className="mt-6 flex justify-end pt-4 border-t border-border/40">
                    <button
                      type="button"
                      onClick={() => removeCollaborator.mutate(collaborator.id)}
                      disabled={removeCollaborator.isPending}
                      className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-destructive/70 transition-colors hover:text-destructive disabled:opacity-50"
                    >
                      {removeCollaborator.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                      Revoke access
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      <AddCollaboratorModal
        collectionId={collectionId}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </motion.section>
  );
}
