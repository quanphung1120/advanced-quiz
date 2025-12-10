"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import {
  updateCollectionSchema,
  UpdateCollectionFormData,
} from "@/features/collections/schemas";
import type { Collection } from "@/features/collections/service/api";

interface EditCollectionFormProps {
  collection: Collection;
  onSubmit: (data: UpdateCollectionFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function EditCollectionForm({
  collection,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: EditCollectionFormProps) {
  const form = useForm<UpdateCollectionFormData>({
    resolver: zodResolver(updateCollectionSchema),
    defaultValues: {
      name: collection.name,
      description: collection.description || "",
    },
  });

  async function handleSubmit(data: UpdateCollectionFormData) {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Failed to update collection:", error);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Edit Collection</CardTitle>
        <CardDescription>
          Update the collection name and description.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="edit-collection-form"
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="edit-collection-name">
                    Collection Name
                  </FieldLabel>
                  <Input
                    {...field}
                    id="edit-collection-name"
                    aria-invalid={fieldState.invalid}
                    placeholder="My Flashcard Collection"
                    autoComplete="off"
                  />
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
                  <FieldLabel htmlFor="edit-collection-description">
                    Description
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupTextarea
                      {...field}
                      value={field.value || ""}
                      id="edit-collection-description"
                      placeholder="A brief description of what this collection covers..."
                      rows={4}
                      className="min-h-24 resize-none"
                      aria-invalid={fieldState.invalid}
                    />
                    <InputGroupAddon align="block-end">
                      <InputGroupText className="tabular-nums">
                        {(field.value || "").length}/1000 characters
                      </InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                  <FieldDescription>
                    Describe the topics and content covered in this collection.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field orientation="horizontal">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="edit-collection-form"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}
