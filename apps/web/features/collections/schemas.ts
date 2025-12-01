import { z } from "zod";

export const createCollectionSchema = z.object({
  name: z
    .string()
    .min(1, "Collection name is required")
    .max(255, "Collection name must be less than 255 characters"),
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional()
    .or(z.literal("")),
  image: z.string().optional(),
});

export const updateCollectionSchema = z.object({
  name: z
    .string()
    .min(1, "Collection name is required")
    .max(255, "Collection name must be less than 255 characters")
    .optional(),
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional()
    .or(z.literal("")),
  image: z.string().optional(),
});

export type CreateCollectionFormData = z.infer<typeof createCollectionSchema>;
export type UpdateCollectionFormData = z.infer<typeof updateCollectionSchema>;
