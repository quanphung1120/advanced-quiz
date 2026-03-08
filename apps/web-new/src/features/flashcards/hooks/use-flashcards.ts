import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { flashcardsApi } from "../api/flashcards-api";

export function useFlashcards(collectionId: string) {
  return useQuery({
    queryKey: ["flashcards", collectionId],
    queryFn: () => flashcardsApi.list(collectionId),
    enabled: Boolean(collectionId),
  });
}

export function useCreateFlashcard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      collectionId,
      data,
    }: {
      collectionId: string;
      data: {
        question: string;
        answer: string;
        type?: string;
      };
    }) =>
      flashcardsApi.create({
        collectionId,
        ...data,
      }),
    onSuccess: (_flashcard, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["flashcards", variables.collectionId],
      });
    },
  });
}

export function useUpdateFlashcard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      collectionId,
      id,
      data,
    }: {
      collectionId: string;
      id: string;
      data: {
        question?: string;
        answer?: string;
        type?: string;
      };
    }) => flashcardsApi.update(collectionId, id, data),
    onSuccess: (_flashcard, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["flashcards", variables.collectionId],
      });
    },
  });
}

export function useDeleteFlashcard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      collectionId,
      id,
    }: {
      collectionId: string;
      id: string;
    }) =>
      flashcardsApi.delete(collectionId, id).then(() => ({
        collectionId,
      })),
    onSuccess: ({ collectionId }) => {
      queryClient.invalidateQueries({
        queryKey: ["flashcards", collectionId],
      });
    },
  });
}
