"use client";

import { useState } from "react";
import { Loader2Icon, AlertTriangleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteCollection } from "../service/actions";
import type { Collection } from "@/types/collection";

interface DeleteCollectionDialogProps {
  collection: Collection;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteCollectionDialog({
  collection,
  open,
  onOpenChange,
}: DeleteCollectionDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setIsDeleting(true);
    setError(null);
    try {
      const result = await deleteCollection(collection.id);
      if (result.success) {
        onOpenChange(false);
      } else {
        setError(result.error || "Failed to delete collection");
      }
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangleIcon className="size-5 text-destructive" />
            </div>
            <div>
              <DialogTitle>Delete Collection</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &quot;{collection.name}&quot;?
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            This action cannot be undone. This will permanently delete this
            collection and all its flashcards.
          </p>
          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting && <Loader2Icon className="size-4 animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
