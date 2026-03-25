import type { UIMessage } from "ai";

export type ChatMessage = UIMessage;

export interface ChatSessionSummary {
  id: string;
  title: string;
  preview: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChatSessionDetail extends ChatSessionSummary {
  messages: ChatMessage[];
}

export interface ListChatSessionsResponse {
  sessions: ChatSessionSummary[];
}

export interface GetChatSessionResponse {
  session: ChatSessionDetail;
}

export interface CreateChatSessionResponse {
  session: ChatSessionDetail;
}
