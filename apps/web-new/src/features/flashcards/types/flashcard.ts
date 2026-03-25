import type { FlashcardType } from "@advanced-quiz/contracts";
import type { CollectionRole } from "@/features/collections/types/collection";

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  type: FlashcardType;
  collectionId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListFlashcardsResponse {
  flashcards: Flashcard[];
  role: CollectionRole;
}

export interface GetFlashcardResponse {
  flashcard: Flashcard;
  role: CollectionRole;
}
