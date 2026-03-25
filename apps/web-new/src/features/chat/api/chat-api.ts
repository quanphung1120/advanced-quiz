import { api } from "@/config/api-client";
import type {
  GetChatSessionResponse,
  ListChatSessionsResponse,
} from "../types/chat";

export const chatApi = {
  listSessions: async () => {
    const response =
      await api.get<ListChatSessionsResponse>("/api/v1/chat/sessions");
    return response.data;
  },
  getSession: async (id: string) => {
    const response = await api.get<GetChatSessionResponse>(
      `/api/v1/chat/sessions/${id}`,
    );
    return response.data;
  },
  /** URL for creating a new session and streaming the first assistant response. */
  buildFirstMessageStreamUrl: () =>
    `${api.defaults.baseURL}/api/v1/chat/sessions/stream`,
  buildStreamUrl: (id: string) =>
    `${api.defaults.baseURL}/api/v1/chat/sessions/${id}/stream`,
  deleteSession: async (id: string) => {
    await api.delete(`/api/v1/chat/sessions/${id}`);
  },
};
