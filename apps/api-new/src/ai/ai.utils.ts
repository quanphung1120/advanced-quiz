import type {
  ChatSessionSummary,
  UIMessageRole,
} from "@advanced-quiz/contracts";
import {
  validateUIMessages,
  type UIMessage,
} from "ai";
import { DEFAULT_SESSION_TITLE, persistedMessagesSchema } from "./ai.constants.js";

export type SessionSummaryRecord = {
  id: string;
  title: string;
  preview: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type SessionWithMessagesRecord = SessionSummaryRecord & {
  messages: unknown;
};

export function serializeSession(
  session: SessionSummaryRecord,
): ChatSessionSummary {
  return {
    id: session.id,
    title: session.title,
    preview: session.preview,
    createdAt: session.createdAt.toISOString(),
    updatedAt: session.updatedAt.toISOString(),
  };
}

export async function appendLatestMessage(
  existingMessages: unknown,
  latestMessage: UIMessage,
): Promise<UIMessage[]> {
  return normalizeMessages([
    ...deserializeMessages(existingMessages),
    latestMessage,
  ]);
}

export function deserializeMessages(messages: unknown): UIMessage[] {
  const parsed = persistedMessagesSchema.safeParse(messages);
  return parsed.success ? (parsed.data as unknown as UIMessage[]) : [];
}

export function normalizeMessages(messages: UIMessage[]): Promise<UIMessage[]> {
  return validateUIMessages({
    messages,
  });
}

export function buildFallbackMetadata(messages: UIMessage[]) {
  const firstUserMessage = messages.find((message) => message.role === "user");
  const latestMessage =
    [...messages]
      .reverse()
      .find((message) => extractMessageText(message).trim().length > 0) ??
    firstUserMessage;

  return {
    title: truncateText(
      extractMessageText(firstUserMessage),
      80,
      DEFAULT_SESSION_TITLE,
    ),
    preview: truncateText(extractMessageText(latestMessage), 160),
  };
}

export function hasMeaningfulTitle(
  currentTitle: string,
  fallbackTitle: string | null | undefined,
) {
  if (currentTitle === DEFAULT_SESSION_TITLE) {
    return false;
  }

  const normalizedCurrentTitle = normalizeTitle(currentTitle);
  const normalizedFallbackTitle = normalizeTitle(fallbackTitle);

  return (
    normalizedCurrentTitle.length > 0 &&
    normalizedCurrentTitle !== normalizedFallbackTitle
  );
}

export function extractMessageText(message?: {
  parts?: unknown[];
  role?: UIMessageRole | string;
}): string {
  if (!message?.parts) {
    return "";
  }

  return message.parts
    .map((part) => {
      if (
        part &&
        typeof part === "object" &&
        "type" in part &&
        "text" in part &&
        (part as { type?: string }).type === "text"
      ) {
        const text = (part as { text?: unknown }).text;
        return typeof text === "string" ? text : "";
      }

      return "";
    })
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

export function truncateText(
  value: string,
  maxLength: number,
  fallback: string | null = null,
) {
  const normalized = value.replace(/\s+/g, " ").trim();

  if (!normalized) {
    return fallback;
  }

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
}

export function normalizeTitle(value?: string | null) {
  return (value ?? "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}
