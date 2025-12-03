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
  is_public: z.boolean(),
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
  is_public: z.boolean().optional(),
});

export const addCollaboratorSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  role: z.enum(["viewer", "editor", "admin"]),
});

export type CreateCollectionFormData = z.infer<typeof createCollectionSchema>;
export type UpdateCollectionFormData = z.infer<typeof updateCollectionSchema>;
export type AddCollaboratorFormData = z.infer<typeof addCollaboratorSchema>;
