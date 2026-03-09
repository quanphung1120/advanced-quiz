import { useDeferredValue, useState } from "react";
import {
  Loader2,
  Mail,
  Search,
  Shield,
  UserPen,
  UserRound,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input, InputAdornment, InputGroup } from "@/components/ui/input";
import { useAddCollaborator, useSearchUsers } from "../hooks/use-collections";

type AddCollaboratorModalProps = {
  collectionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const ROLE_OPTIONS = [
  {
    value: "viewer" as const,
    label: "Viewer",
    description: "Can inspect the deck and study it.",
    icon: UserRound,
  },
  {
    value: "editor" as const,
    label: "Editor",
    description: "Can create, update, and delete flashcards.",
    icon: UserPen,
  },
  {
    value: "admin" as const,
    label: "Admin",
    description: "Can also manage collaborators.",
    icon: Shield,
  },
];

export function AddCollaboratorModal({
  collectionId,
  open,
  onOpenChange,
}: AddCollaboratorModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] =
    useState<(typeof ROLE_OPTIONS)[number]["value"]>("viewer");
  const deferredEmail = useDeferredValue(email.trim());
  const suggestionsQuery = useSearchUsers(deferredEmail);
  const addCollaborator = useAddCollaborator(collectionId);

  const reset = () => {
    setEmail("");
    setRole("viewer");
  };

  return (
    <Modal
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) {
          reset();
        }
      }}
      title="Invite Collaborator"
      description="Connect this knowledge base with other workspace members. Define their operational control below."
    >
      <form
        className="space-y-6"
        onSubmit={async (event) => {
          event.preventDefault();
          await addCollaborator.mutateAsync({
            email: email.trim(),
            role,
          });
          reset();
          onOpenChange(false);
        }}
      >
        <Field>
          <FieldLabel
            htmlFor="collaborator-email"
            className="ml-1 text-[10px] tracking-[0.2em]"
          >
            Email Identity
          </FieldLabel>
          <InputGroup>
            <InputAdornment>
              <Mail className="h-4 w-4" />
            </InputAdornment>
            <Input
              id="collaborator-email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              required
              placeholder="teammate@example.com"
              className="rounded-none border-0 bg-transparent px-0 py-0 font-medium focus:bg-transparent focus:ring-0"
            />
          </InputGroup>
        </Field>

        <div className="rounded-xl border border-border bg-muted/20 p-5 overflow-hidden">
          <div className="flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
            <Search className="h-3.5 w-3.5" />
            Suggested Matches
          </div>
          <div className="mt-4 space-y-2 min-h-[40px]">
            {suggestionsQuery.isLoading ? (
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground animate-pulse">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Searching workspace...
              </div>
            ) : suggestionsQuery.data?.length ? (
              <div className="grid gap-2">
                {suggestionsQuery.data.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setEmail(suggestion)}
                    className="flex w-full items-center justify-between rounded-lg border border-border bg-card px-4 py-2.5 text-left text-xs font-semibold transition-all hover:border-primary/30 hover:bg-primary/5 group"
                  >
                    <span>{suggestion}</span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      Assign
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                Type an email address to filter members. Results appear as you type.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <FieldLabel className="ml-1 text-[10px] tracking-[0.2em]">
            Operational Role
          </FieldLabel>
          <div className="grid gap-3">
            {ROLE_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isActive = role === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setRole(option.value)}
                  className={[
                    "flex items-start gap-4 rounded-xl border p-4 text-left transition-all group",
                    isActive
                      ? "border-primary/60 bg-primary/10 shadow-[0_0_20px_oklch(0.52_0.26_258_/_0.08),inset_0_0_0_1px_oklch(0.52_0.26_258_/_0.1)]"
                      : "border-border bg-card/60 hover:border-primary/30 hover:bg-card",
                  ].join(" ")}
                >
                  <div className={[
                    "shrink-0 flex h-10 w-10 items-center justify-center rounded-lg border transition-all",
                    isActive 
                      ? "bg-primary text-primary-foreground border-primary shadow-[0_0_12px_oklch(0.52_0.26_258_/_0.4)]" 
                      : "bg-muted/80 text-muted-foreground border-border group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20"
                  ].join(" ")}>
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className={[
                      "text-sm font-bold tracking-tight",
                      isActive ? "text-foreground" : "text-muted-foreground transition-colors group-hover:text-foreground"
                    ].join(" ")}>
                      {option.label}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground/80 font-medium">
                      {option.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {addCollaborator.error && (
          <Alert
            variant="destructive"
            className="animate-in slide-in-from-top-1 fade-in text-xs font-semibold"
          >
            {addCollaborator.error instanceof Error
              ? addCollaborator.error.message
              : "Failed to add collaborator. Verify access trace."}
          </Alert>
        )}

        <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-border/60">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              reset();
              onOpenChange(false);
            }}
            className="font-bold"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={addCollaborator.isPending}
            className="px-8 shadow-[0_8px_24px_oklch(0.52_0.26_258_/_0.2)]"
          >
            {addCollaborator.isPending ? "Inviting..." : "Grant Access"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
