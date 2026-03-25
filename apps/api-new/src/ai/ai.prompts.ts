import {
  generateText,
  Output,
  stepCountIs,
  tool,
  type LanguageModel,
  type UIMessage,
} from "ai";
import { z } from "zod";
import { DEFAULT_SESSION_TITLE } from "./ai.constants.js";
import {
  extractMessageText,
  hasMeaningfulTitle,
  truncateText,
} from "./ai.utils.js";

const titleSchema = z.object({
  title: z.string().min(1).max(80),
});

const SESSION_TITLE_SYSTEM_PROMPT = [
  "You create concise session titles.",
  "Always inspect the current title state first using the available tool.",
  "If the tool reports that a meaningful title already exists, return that title exactly unchanged.",
  "If the tool reports that no meaningful title exists yet, generate a 2 to 6 word topic label.",
  "Do not copy the user's message verbatim.",
  "Do not write a full sentence.",
  "Do not use quotation marks, markdown, or trailing punctuation.",
].join("\n");

function buildConversationSnippet(messages: UIMessage[]) {
  return messages
    .filter(
      (message) =>
        message.role === "user" || message.role === "assistant",
    )
    .map(
      (message) =>
        `${message.role.toUpperCase()}: ${extractMessageText(message)}`,
    )
    .filter((line) => line.trim().length > 0)
    .join("\n");
}

type GenerateSessionTitleParams = {
  currentTitle: string;
  fallbackTitle: string | null | undefined;
  messages: UIMessage[];
  model: LanguageModel;
  logWarning?: (message: string) => void;
};

export async function generateSessionTitle({
  currentTitle,
  fallbackTitle,
  messages,
  model,
  logWarning,
}: GenerateSessionTitleParams): Promise<string | null> {
  const conversationSnippet = buildConversationSnippet(messages);

  if (!conversationSnippet) {
    return null;
  }

  try {
    const { output } = await generateText({
      model,
      system: SESSION_TITLE_SYSTEM_PROMPT,
      prompt: [
        "Determine the final session title for this conversation.",
        "",
        conversationSnippet,
      ].join("\n"),
      tools: {
        inspectCurrentTitle: tool({
          description:
            "Check whether the session already has a meaningful non-placeholder title.",
          inputSchema: z.object({}),
          execute: async () => ({
            currentTitle,
            fallbackTitle: fallbackTitle ?? DEFAULT_SESSION_TITLE,
            hasMeaningfulTitle: hasMeaningfulTitle(
              currentTitle,
              fallbackTitle,
            ),
          }),
        }),
      },
      stopWhen: stepCountIs(5),
      prepareStep: ({ stepNumber }) =>
        stepNumber === 0
          ? {
            activeTools: ["inspectCurrentTitle"],
            toolChoice: {
              type: "tool",
              toolName: "inspectCurrentTitle",
            },
          }
          : {
            activeTools: [],
            toolChoice: "none",
          },
      output: Output.object({
        schema: titleSchema,
      }),
    });

    return (
      truncateText(output.title, 80, DEFAULT_SESSION_TITLE) ??
      DEFAULT_SESSION_TITLE
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logWarning?.(`Session title generation failed: ${message}`);
    return null;
  }
}
