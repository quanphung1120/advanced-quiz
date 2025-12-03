"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import { updateCollection } from "../service/actions";
import {
  updateCollectionSchema,
  type UpdateCollectionFormData,
} from "../schemas";
import type { Collection } from "@/types/collection";

interface EditCollectionDialogProps {
  collection: Collection;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditCollectionDialog({
  collection,
  open,
  onOpenChange,
}: EditCollectionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UpdateCollectionFormData>({
    resolver: zodResolver(updateCollectionSchema),
    defaultValues: {
      name: collection.name,
      description: collection.description || "",
      is_public: collection.is_public || false,
    },
  });

  async function onSubmit(data: UpdateCollectionFormData) {
    setIsSubmitting(true);
    try {
      const result = await updateCollection(collection.id, data);
      if (result.success) {
        onOpenChange(false);
      } else {
        form.setError("root", { message: result.error });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Edit Collection</DialogTitle>
            <DialogDescription>
              Make changes to your collection.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder="JavaScript Fundamentals"
                    autoComplete="off"
                  />
                  <FieldDescription>
                    Give your collection a descriptive name.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                  <Textarea
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder="Core concepts and syntax of JavaScript..."
                    rows={3}
                  />
                  <FieldDescription>
                    Optionally describe what this collection is about.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {form.formState.errors.root && (
              <p className="text-sm text-destructive">
                {form.formState.errors.root.message}
              </p>
            )}

            <Controller
              name="is_public"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor={field.name}>Public</FieldLabel>
                    <Switch
                      checked={!!field.value}
                      onCheckedChange={(val) => field.onChange(val)}
                      id={field.name}
                    />
                  </div>
                  <FieldDescription>
                    When enabled, the collection will be visible to everyone;
                    otherwise it will be private.
                  </FieldDescription>
                </Field>
              )}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2Icon className="size-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
