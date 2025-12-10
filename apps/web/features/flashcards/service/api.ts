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

const GetFlashcardsResponseSchema = z.object({
  flashcards: z.array(FlashcardSchema).nullable(),
  role: z.enum(["owner", "editor", "viewer"]).optional(),
  errorMessage: z.string().optional(),
});

const GetFlashcardResponseSchema = z.object({
  flashcard: FlashcardSchema.nullable(),
  role: z.enum(["owner", "editor", "viewer"]).optional(),
  errorMessage: z.string().optional(),
});

// ============================================================
// Types (inferred from Zod schemas)
// ============================================================

export type Flashcard = z.infer<typeof FlashcardSchema>;

// ============================================================
// API Configuration
// ============================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// ============================================================
// API Functions
// ============================================================

export async function getCollectionFlashcards(collectionId: string): Promise<{
  flashcards: Flashcard[];
  role: "owner" | "editor" | "viewer" | null;
}> {
  const { getToken, isAuthenticated } = await auth();

  if (!getToken || !isAuthenticated) {
    return { flashcards: [], role: null };
  }

  const token = await getToken();

  if (!token) {
    return { flashcards: [], role: null };
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/collections/${collectionId}/flashcards`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        next: { tags: [`flashcards-${collectionId}`] },
      }
    );

    if (!response.ok) {
      return { flashcards: [], role: null };
    }

    const json = await response.json();
    const parsed = GetFlashcardsResponseSchema.safeParse(json);

    if (!parsed.success) {
      console.error(
        "Failed to parse getCollectionFlashcards response:",
        parsed.error
      );
      return { flashcards: [], role: null };
    }

    return {
      flashcards: parsed.data.flashcards || [],
      role: parsed.data.role || null,
    };
  } catch {
    return { flashcards: [], role: null };
  }
}

export async function getFlashcard(
  collectionId: string,
  flashcardId: string
): Promise<{
  flashcard: Flashcard | null;
  role: "owner" | "editor" | "viewer" | null;
}> {
  const { getToken, isAuthenticated } = await auth();

  if (!getToken || !isAuthenticated) {
    return { flashcard: null, role: null };
  }

  const token = await getToken();

  if (!token) {
    return { flashcard: null, role: null };
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/collections/${collectionId}/flashcards/${flashcardId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      return { flashcard: null, role: null };
    }

    const json = await response.json();
    const parsed = GetFlashcardResponseSchema.safeParse(json);

    if (!parsed.success) {
      console.error("Failed to parse getFlashcard response:", parsed.error);
      return { flashcard: null, role: null };
    }

    return {
      flashcard: parsed.data.flashcard || null,
      role: parsed.data.role || null,
    };
  } catch {
    return { flashcard: null, role: null };
  }
}
