"use server";

import { updateTag } from "next/cache";
import { fetchWithAuth } from "@/lib/api";
import type {
  CreateFlashcardRequest,
  CreateFlashcardResponse,
} from "@/types/flashcard";

export async function createFlashcard(
  collectionId: string,
  data: CreateFlashcardRequest
): Promise<{ success: boolean; error?: string }> {
  try {
    await fetchWithAuth<CreateFlashcardResponse>(
      `/api/v1/collections/${collectionId}/flashcards`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );

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
