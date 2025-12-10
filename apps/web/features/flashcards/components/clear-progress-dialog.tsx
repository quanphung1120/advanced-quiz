"use client";

import * as React from "react";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { clearProgressAction } from "@/features/flashcards/service/review-actions";
import { toast } from "sonner";

interface ClearProgressDialogProps {
  collectionId: string;
  collectionName: string;
}

export function ClearProgressDialog({
  collectionId,
  collectionName,
}: ClearProgressDialogProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isClearing, setIsClearing] = React.useState(false);

  const handleClearProgress = async () => {
    setIsClearing(true);
    try {
      const result = await clearProgressAction(collectionId);

      if (result.success) {
        toast.success("Progress cleared", {
          description: `Successfully cleared learning progress. ${result.deleted ?? 0} review(s) removed.`,
        });
        setIsOpen(false);
      } else {
        toast.error("Error", {
          description: result.error || "Failed to clear progress",
        });
      }
    } catch (error) {
      console.error("Failed to clear progress:", error);
      toast.error("Error", {
        description: "An unexpected error occurred",
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
        >
          <Trash2 className="size-4" />
          Clear Progress
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-destructive" />
            Clear Learning Progress
          </DialogTitle>
          <DialogDescription className="space-y-2">
            <p>
              Are you sure you want to clear all learning progress for{" "}
              <span className="font-semibold text-foreground">
                &ldquo;{collectionName}&rdquo;
              </span>
              ?
            </p>
            <p className="text-sm">
              This will reset all spaced repetition data including intervals,
              ease factors, review counts, and due dates. This action cannot be
              undone.
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isClearing}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={handleClearProgress}
            disabled={isClearing}
            variant="destructive"
          >
            {isClearing ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Clearing...
              </>
            ) : (
              <>
                <Trash2 className="size-4" />
                Clear Progress
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
