import {
  Flashcard,
  GetFlashcardsResponse,
  GetFlashcardResponse,
} from "@/types/flashcard";
import { auth } from "@clerk/nextjs/server";

export async function getCollectionFlashcards(collectionId: string): Promise<{
  flashcards: Flashcard[];
  role: "owner" | "editor" | "viewer" | null;
}> {
  const { getToken, isAuthenticated } = await auth();

  if (!getToken || !isAuthenticated) {
    console.error(
      "[FRONTEND] No auth token available for getCollectionFlashcards"
    );
    return { flashcards: [], role: null };
  }

  const token = await getToken();

  if (!token) {
    console.error(
      "[FRONTEND] Failed to retrieve auth token for getCollectionFlashcards"
    );
    return { flashcards: [], role: null };
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/collections/${collectionId}/flashcards`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        next: { tags: [`flashcards-${collectionId}`] },
      }
    );

    if (!response.ok) {
      console.error("[FRONTEND] API request failed:", await response.text());
      return { flashcards: [], role: null };
    }

    const data: GetFlashcardsResponse = await response.json();
    return {
      flashcards: data.flashcards || [],
      role: data.role || null,
    };
  } catch (error) {
    console.error("[FRONTEND] Failed to fetch flashcards:", error);
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
    console.error("[FRONTEND] No auth token available for getFlashcard");
    return { flashcard: null, role: null };
  }

  const token = await getToken();

  if (!token) {
    console.error("[FRONTEND] Failed to retrieve auth token for getFlashcard");
    return { flashcard: null, role: null };
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/collections/${collectionId}/flashcards/${flashcardId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      console.error("[FRONTEND] API request failed:", response.status);
      return { flashcard: null, role: null };
    }

    const data: GetFlashcardResponse = await response.json();
    return {
      flashcard: data.flashcard || null,
      role: data.role || null,
    };
  } catch (error) {
    console.error("[FRONTEND] Failed to fetch flashcard:", error);
    return { flashcard: null, role: null };
  }
}
