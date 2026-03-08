import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { collectionsApi } from "../api/collections-api";

export function useCollections() {
  return useQuery({
    queryKey: ["collections"],
    queryFn: collectionsApi.list,
  });
}

export function useCollection(id: string) {
  return useQuery({
    queryKey: ["collections", id],
    queryFn: () => collectionsApi.get(id),
    enabled: Boolean(id),
  });
}

export function useCreateCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: collectionsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });
}

export function useUpdateCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {
        name?: string;
        description?: string;
        isPublic?: boolean;
      };
    }) => collectionsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      queryClient.invalidateQueries({
        queryKey: ["collections", variables.id],
      });
    },
  });
}

export function useDeleteCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: collectionsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });
}

export function useSearchUsers(query: string) {
  return useQuery({
    queryKey: ["users", "search", query],
    queryFn: () => collectionsApi.searchUsers(query),
    enabled: query.trim().length >= 2,
    staleTime: 30_000,
  });
}

export function useAddCollaborator(collectionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { email: string; role: "viewer" | "editor" | "admin" }) =>
      collectionsApi.addCollaborator(collectionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      queryClient.invalidateQueries({
        queryKey: ["collections", collectionId],
      });
    },
  });
}

export function useRemoveCollaborator(collectionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (collaboratorId: string) =>
      collectionsApi.removeCollaborator(collectionId, collaboratorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      queryClient.invalidateQueries({
        queryKey: ["collections", collectionId],
      });
    },
  });
}
