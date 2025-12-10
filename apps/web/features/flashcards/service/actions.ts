"use server";

import { updateTag } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

// ============================================================
// Zod Schemas
// ============================================================

const FlashcardSchema = z.object({
  id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  question: z.string(),
  answer: z.string(),
  type: z.enum(["simple", "multiple_choice"]),
  collection_id: z.string(),
  created_by: z.string(),
});

const CreateFlashcardResponseSchema = z.object({
  flashcard: FlashcardSchema.optional(),
  errorMessage: z.string().optional(),
});

// ============================================================
// Types
// ============================================================

export interface CreateFlashcardRequest {
  question: string;
  answer: string;
  type?: string;
}

// ============================================================
// API Configuration
// ============================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// ============================================================
// Server Actions
// ============================================================

export async function createFlashcard(
  collectionId: string,
  data: CreateFlashcardRequest
): Promise<{ success: boolean; error?: string }> {
  const { getToken } = await auth();
  const token = await getToken();

  if (!token) {
    return { success: false, error: "User is not authenticated" };
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/collections/${collectionId}/flashcards`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }
    );

    const json = await response.json();
    const parsed = CreateFlashcardResponseSchema.safeParse(json);

    if (!parsed.success) {
      console.error("Failed to parse createFlashcard response:", parsed.error);
      return { success: false, error: "Invalid response from server" };
    }

    if (parsed.data.errorMessage) {
      return { success: false, error: parsed.data.errorMessage };
    }

    updateTag(`flashcards-${collectionId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to create flashcard:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create flashcard",
    };
  }
}
