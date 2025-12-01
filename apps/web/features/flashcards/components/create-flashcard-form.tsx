"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";

const createFlashcardFormSchema = z.object({
  question: z
    .string()
    .min(1, "Question is required")
    .max(1000, "Question must be less than 1000 characters"),
  answer: z
    .string()
    .min(1, "Answer is required")
    .max(2000, "Answer must be less than 2000 characters"),
});

type CreateFlashcardFormValues = z.infer<typeof createFlashcardFormSchema>;

interface CreateFlashcardFormProps {
  collectionId: string;
  onSubmit: (
    data: CreateFlashcardFormValues & { type: string }
  ) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function CreateFlashcardForm({
  collectionId,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: CreateFlashcardFormProps) {
  const form = useForm<CreateFlashcardFormValues>({
    resolver: zodResolver(createFlashcardFormSchema),
    defaultValues: {
      question: "",
      answer: "",
    },
  });

  async function handleSubmit(data: CreateFlashcardFormValues) {
    try {
      await onSubmit({ ...data, type: "simple" });
      form.reset();
    } catch (error) {
      console.error("Failed to create flashcard:", error);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Add Flashcard</CardTitle>
        <CardDescription>
          Create a new flashcard for this collection.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id={`create-flashcard-form-${collectionId}`}
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <FieldGroup>
            <Controller
              name="question"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`flashcard-question-${collectionId}`}>
                    Question
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupTextarea
                      {...field}
                      id={`flashcard-question-${collectionId}`}
                      placeholder="What is the capital of France?"
                      rows={3}
                      className="min-h-20 resize-none"
                      aria-invalid={fieldState.invalid}
                    />
                    <InputGroupAddon align="block-end">
                      <InputGroupText className="tabular-nums">
                        {(field.value || "").length}/1000 characters
                      </InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                  <FieldDescription>
                    Write a clear, concise question that tests a single concept.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="answer"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`flashcard-answer-${collectionId}`}>
                    Answer
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupTextarea
                      {...field}
                      id={`flashcard-answer-${collectionId}`}
                      placeholder="Paris"
                      rows={4}
                      className="min-h-24 resize-none"
                      aria-invalid={fieldState.invalid}
                    />
                    <InputGroupAddon align="block-end">
                      <InputGroupText className="tabular-nums">
                        {(field.value || "").length}/2000 characters
                      </InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                  <FieldDescription>
                    Provide a complete answer. You can include explanations or
                    examples.
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
            form={`create-flashcard-form-${collectionId}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Flashcard"}
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}
