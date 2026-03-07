import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

type CollectionValues = {
  name: string;
  description?: string;
  isPublic?: boolean;
};

type CollectionFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  submitLabel: string;
  isPending?: boolean;
  initialValues?: CollectionValues;
  onSubmit: (values: CollectionValues) => Promise<void>;
};

export function CollectionFormModal({
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  isPending,
  initialValues,
  onSubmit,
}: CollectionFormModalProps) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [details, setDetails] = useState(initialValues?.description ?? "");
  const [isPublic, setIsPublic] = useState(initialValues?.isPublic ?? false);

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
    >
      <form
        className="space-y-6"
        onSubmit={async (event) => {
          event.preventDefault();
          await onSubmit({
            name,
            description: details.trim() || undefined,
            isPublic,
          });
        }}
      >
        <div className="space-y-2">
          <label
            htmlFor="collection-name"
            className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1"
          >
            Collection Title
          </label>
          <input
            id="collection-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Molecular Biology II"
            required
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition-all placeholder:text-muted-foreground/50 focus:border-primary/60 focus:bg-primary/5 font-medium"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="collection-description"
            className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1"
          >
            Detailed Description
          </label>
          <textarea
            id="collection-description"
            value={details}
            onChange={(event) => setDetails(event.target.value)}
            rows={4}
            placeholder="What knowledge gaps does this deck bridge?"
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition-all placeholder:text-muted-foreground/50 focus:border-primary/60 focus:bg-primary/5 font-medium resize-none"
          />
        </div>

        <div className="p-4 rounded-lg border border-border bg-muted/25 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-bold">Public Accessibility</p>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                Allow other workspace members to discover and study this
                collection.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(event) => setIsPublic(event.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-muted border border-border rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-foreground after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background peer-checked:after:bg-foreground after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary transition-colors group-hover:border-primary/40"></div>
            </label>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="font-bold"
          >
            Discard
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="px-8 shadow-[0_8px_24px_oklch(0.52_0.26_258_/_0.2)]"
          >
            {isPending ? "Syncing..." : submitLabel}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
