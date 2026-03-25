import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { chatApi } from "../api/chat-api";

export function useChatSessions(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["chat", "sessions"],
    queryFn: chatApi.listSessions,
    enabled: options?.enabled,
  });
}

export function useChatSession(id: string) {
  return useQuery({
    queryKey: ["chat", "sessions", id],
    queryFn: () => chatApi.getSession(id),
    enabled: Boolean(id),
  });
}

export function useDeleteChatSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: chatApi.deleteSession,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["chat", "sessions"] });
    },
  });
}
