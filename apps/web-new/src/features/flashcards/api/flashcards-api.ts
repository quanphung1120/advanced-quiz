import { api } from "@/lib/api-client";

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  type: string;
  collectionId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListFlashcardsResponse {
  flashcards: Flashcard[];
  role: "owner" | "viewer" | "editor" | "admin";
}

export interface GetFlashcardResponse {
  flashcard: Flashcard;
  role: "owner" | "viewer" | "editor" | "admin";
}

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
    type?: string;
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
      type?: string;
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
