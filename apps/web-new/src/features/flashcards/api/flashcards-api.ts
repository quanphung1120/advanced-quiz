import type { FlashcardType } from "@advanced-quiz/contracts";
import { api } from "@/config/api-client";
import type {
  Flashcard,
  GetFlashcardResponse,
  ListFlashcardsResponse,
} from "../types/flashcard";

export const flashcardsApi = {
  list: async (collectionId: string) => {
    const res = await api.get<ListFlashcardsResponse>(
      `/api/v1/collections/${collectionId}/flashcards`,
    );
    return res.data;
  },
  get: async (collectionId: string, flashcardId: string) => {
    const res = await api.get<GetFlashcardResponse>(
      `/api/v1/collections/${collectionId}/flashcards/${flashcardId}`,
    );
    return res.data;
  },
  create: async (data: {
    collectionId: string;
    question: string;
    answer: string;
    type?: FlashcardType;
  }) => {
    const res = await api.post<{ flashcard: Flashcard }>(
      `/api/v1/collections/${data.collectionId}/flashcards`,
      {
        question: data.question,
        answer: data.answer,
        type: data.type,
      },
    );
    return res.data.flashcard;
  },
  update: async (
    collectionId: string,
    flashcardId: string,
    data: {
      question?: string;
      answer?: string;
      type?: FlashcardType;
    },
  ) => {
    const res = await api.put<{ flashcard: Flashcard }>(
      `/api/v1/collections/${collectionId}/flashcards/${flashcardId}`,
      data,
    );
    return res.data.flashcard;
  },
  delete: async (collectionId: string, flashcardId: string) => {
    await api.delete(`/api/v1/collections/${collectionId}/flashcards/${flashcardId}`);
  },
};
