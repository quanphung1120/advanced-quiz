import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@advanced-quiz/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@advanced-quiz/ui/components/dialog";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@advanced-quiz/ui/components/field";
import { Input } from "@advanced-quiz/ui/components/input";
import { Switch } from "@advanced-quiz/ui/components/switch";
import { Textarea } from "@advanced-quiz/ui/components/textarea";

type CollectionValues = {
  name: string;
  description?: string;
  isPublic?: boolean;
};

const collectionFormSchema = z.object({
  name: z.string().trim().min(1, "Collection title is required"),
  description: z.string(),
  isPublic: z.boolean(),
});

type CollectionFormValues = z.infer<typeof collectionFormSchema>;

function getDefaultValues(
  initialValues?: CollectionValues,
): CollectionFormValues {
  return {
    name: initialValues?.name ?? "",
    description: initialValues?.description ?? "",
    isPublic: initialValues?.isPublic ?? false,
  };
}

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
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CollectionFormValues>({
    resolver: zodResolver(collectionFormSchema),
    defaultValues: getDefaultValues(initialValues),
  });

  useEffect(() => {
    reset(getDefaultValues(initialValues));
  }, [initialValues, open, reset]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      reset(getDefaultValues(initialValues));
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg gap-0 p-0 sm:max-w-lg">
      <form
        className="flex flex-col"
        onSubmit={handleSubmit(async (values) => {
          await onSubmit({
            name: values.name,
            description: values.description.trim() || undefined,
            isPublic: values.isPublic,
          });
        })}
      >
        <div className="flex flex-col gap-6 p-6 sm:p-8">
          <DialogHeader className="pr-8">
            <DialogTitle className="font-display text-2xl font-bold tracking-tight">
              {title}
            </DialogTitle>
            <DialogDescription className="max-w-xl text-sm leading-6">
              {description}
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <Field data-invalid={errors.name ? true : undefined}>
              <FieldLabel
                htmlFor="collection-name"
                className="text-[10px] uppercase tracking-[0.2em]"
              >
                Collection Title
              </FieldLabel>
              <FieldContent>
                <Input
                  id="collection-name"
                  placeholder="e.g. Molecular Biology II"
                  aria-invalid={errors.name ? true : undefined}
                  className="h-11 font-medium"
                  {...register("name")}
                />
                <FieldError errors={errors.name ? [errors.name] : undefined} />
              </FieldContent>
            </Field>

            <Field data-invalid={errors.description ? true : undefined}>
              <FieldLabel
                htmlFor="collection-description"
                className="text-[10px] uppercase tracking-[0.2em]"
              >
                Detailed Description
              </FieldLabel>
              <FieldContent>
                <Textarea
                  id="collection-description"
                  rows={4}
                  placeholder="What knowledge gaps does this deck bridge?"
                  aria-invalid={errors.description ? true : undefined}
                  className="font-medium"
                  {...register("description")}
                />
                <FieldError
                  errors={errors.description ? [errors.description] : undefined}
                />
              </FieldContent>
            </Field>

            <Field
              orientation="horizontal"
              className="rounded-none border border-border bg-muted/25 p-4"
            >
              <FieldContent className="gap-1">
                <FieldLabel
                  htmlFor="collection-visibility"
                  className="text-sm font-bold normal-case tracking-normal text-foreground"
                >
                  Public Accessibility
                </FieldLabel>
                <FieldDescription className="text-xs font-medium leading-relaxed">
                  Allow other workspace members to discover and study this
                  collection.
                </FieldDescription>
              </FieldContent>
              <Controller
                control={control}
                name="isPublic"
                render={({ field }) => (
                  <Switch
                    id="collection-visibility"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </Field>
          </FieldGroup>
        </div>

        <DialogFooter className="border-t border-border/60 px-6 py-4 sm:px-8">
          <Button
            type="button"
            variant="ghost"
            onClick={() => handleOpenChange(false)}
            className="font-bold"
          >
            Discard
          </Button>
          <Button
            type="submit"
            disabled={isPending || isSubmitting}
            className="px-8 shadow-[0_8px_24px_oklch(0.52_0.26_258_/_0.2)]"
          >
            {isPending ? "Syncing..." : submitLabel}
          </Button>
        </DialogFooter>
      </form>
      </DialogContent>
    </Dialog>
  );
}
