export interface Flashcard {
  id: string;
  created_at: string;
  updated_at: string;
  question: string;
  answer: string;
  type: "simple" | "multiple_choice";
  collection_id: string;
  created_by: string;
}

export interface GetFlashcardsResponse {
  flashcards: Flashcard[];
  role: "owner" | "editor" | "viewer";
  errorMessage: string;
}

export interface GetFlashcardResponse {
  flashcard: Flashcard;
  role: "owner" | "editor" | "viewer";
  errorMessage: string;
}

export interface CreateFlashcardRequest {
  question: string;
  answer: string;
  type?: string;
}

export interface UpdateFlashcardRequest {
  question?: string;
  answer?: string;
  type?: string;
}

export interface CreateFlashcardResponse {
  flashcard: Flashcard;
  errorMessage: string;
}

export interface UpdateFlashcardResponse {
  flashcard: Flashcard;
  errorMessage: string;
}

export interface DeleteFlashcardResponse {
  message: string;
  errorMessage?: string;
}
