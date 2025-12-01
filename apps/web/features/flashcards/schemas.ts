import { z } from "zod";

export const createFlashcardSchema = z.object({
  question: z
    .string()
    .min(1, "Question is required")
    .max(1000, "Question must be less than 1000 characters"),
  answer: z
    .string()
    .min(1, "Answer is required")
    .max(2000, "Answer must be less than 2000 characters"),
  type: z.enum(["simple", "multiple_choice"]),
});

export const updateFlashcardSchema = z.object({
  question: z
    .string()
    .min(1, "Question is required")
    .max(1000, "Question must be less than 1000 characters")
    .optional(),
  answer: z
    .string()
    .min(1, "Answer is required")
    .max(2000, "Answer must be less than 2000 characters")
    .optional(),
  type: z.enum(["simple", "multiple_choice"]).optional(),
});

export type CreateFlashcardFormData = z.infer<typeof createFlashcardSchema>;
export type UpdateFlashcardFormData = z.infer<typeof updateFlashcardSchema>;
