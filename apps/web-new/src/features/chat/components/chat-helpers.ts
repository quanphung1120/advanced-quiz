import { isReasoningUIPart, isTextUIPart, type UIMessage } from "ai";

function compactWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function collectMessagePartText(
  message: UIMessage,
  matcher: (
    part: UIMessage["parts"][number],
  ) => part is Extract<UIMessage["parts"][number], { text: string }>,
) {
  const chunks: string[] = [];

  for (const part of message.parts) {
    if (matcher(part)) {
      chunks.push(part.text);
    }
  }

  return chunks.join("");
}

export function getMessageReasoning(message: UIMessage) {
  return collectMessagePartText(message, isReasoningUIPart);
}

export function getMessageText(message: UIMessage) {
  return collectMessagePartText(message, isTextUIPart);
}

export function getSessionPreview(message: UIMessage) {
  const text = compactWhitespace(getMessageText(message));
  if (!text) {
    return message.role === "user"
      ? "User message"
      : message.role === "assistant"
        ? "Assistant reply"
        : "Conversation update";
  }

  return text;
}
