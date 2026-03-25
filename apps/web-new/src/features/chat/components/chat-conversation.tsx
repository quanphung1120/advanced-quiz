import { useEffect, useEffectEvent } from "react";
import type { UIMessage } from "ai";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
  useStickToBottomContext,
} from "@advanced-quiz/ui/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@advanced-quiz/ui/components/ai-elements/message";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@advanced-quiz/ui/components/ai-elements/reasoning";
import { cn } from "@/utils/cn";
import { getMessageReasoning, getMessageText } from "./chat-helpers";

const CONVERSATION_TAIL_SPACE_CLASS = "h-40 sm:h-48";

function MessageLabel({ role }: { role: UIMessage["role"] }) {
  if (role === "user") {
    return "You";
  }

  if (role === "assistant") {
    return "Study Assistant";
  }

  return "System";
}

function ChatConversationMessage({ message }: { message: UIMessage }) {
  const text = getMessageText(message);
  const reasoning = getMessageReasoning(message);
  const isUser = message.role === "user";

  return (
    <div className={cn("flex flex-col gap-3", isUser && "items-end")}>
      <div
        className={cn(
          "flex items-center gap-2 text-xs font-medium text-muted-foreground",
          isUser && "justify-end",
        )}
      >
        <span>{MessageLabel({ role: message.role })}</span>
      </div>

      <Message
        from={message.role}
        className={cn("w-full max-w-full", isUser && "max-w-[85%]")}
      >
        {reasoning ? (
          <Reasoning
            className="w-full border border-border/70 bg-background px-4 py-3"
            defaultOpen={false}
          >
            <ReasoningTrigger />
            <ReasoningContent>{reasoning}</ReasoningContent>
          </Reasoning>
        ) : null}

        <MessageContent
          className={cn(
            "w-full max-w-none px-4 py-3 text-sm leading-6 shadow-none",
            isUser
              ? "border border-primary bg-primary text-primary-foreground"
              : "bg-transparent px-0 py-0 text-foreground",
          )}
        >
          {text ? (
            <MessageResponse>{text}</MessageResponse>
          ) : null}
        </MessageContent>
      </Message>
    </div>
  );
}

function ConversationHero({
  title,
  preview,
}: {
  title: string;
  preview: string | null;
}) {
  return (
    <div className="mb-2 space-y-2 border-b border-border pb-6">
      <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
        {title || "Current session"}
      </h1>
      <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
        {preview ||
          "Keep this thread focused on one study problem so the session history stays useful."}
      </p>
    </div>
  );
}

function EmptyConversationState() {
  return (
    <ConversationEmptyState
      className="mx-auto flex w-full max-w-4xl items-start justify-center px-5 py-10 text-left sm:px-8 lg:px-10"
      description=""
      title=""
    >
      <div className="max-w-2xl space-y-2">
        <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Ask for the next useful study step.
        </h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Use the composer below to generate questions, rewrite notes, or turn a
          topic into a cleaner revision plan.
        </p>
      </div>
    </ConversationEmptyState>
  );
}

function ConversationAutoScroll({
  latestMessageId,
  latestMessageRole,
  isStreaming,
}: {
  latestMessageId?: string;
  latestMessageRole?: UIMessage["role"];
  isStreaming: boolean;
}) {
  const { scrollToBottom } = useStickToBottomContext();

  const scrollLatestIntoView = useEffectEvent(() => {
    void scrollToBottom({
      animation: isStreaming ? "instant" : "smooth",
    });
  });

  useEffect(() => {
    if (!latestMessageId) {
      return;
    }

    scrollLatestIntoView();
  }, [isStreaming, latestMessageId, latestMessageRole]);

  return null;
}

export function ChatConversation({
  messages,
  isStreaming,
  title,
  preview,
}: {
  messages: UIMessage[];
  isStreaming: boolean;
  title: string;
  preview: string | null;
}) {
  const latestMessage = messages.at(-1);

  return (
    <Conversation className="min-h-0 flex-1">
      {messages.length > 0 ? (
        <ConversationContent className="mx-auto flex w-full max-w-4xl gap-6 px-5 pb-8 pt-8 sm:px-8 lg:px-10">
          <ConversationAutoScroll
            latestMessageId={latestMessage?.id}
            latestMessageRole={latestMessage?.role}
            isStreaming={isStreaming}
          />
          <ConversationHero title={title} preview={preview} />

          {messages.map((message) => (
            <ChatConversationMessage key={message.id} message={message} />
          ))}

          {isStreaming ? (
            <div className="text-sm text-muted-foreground">
              Study Assistant is drafting a response...
            </div>
          ) : null}

          <div
            aria-hidden="true"
            className={cn("w-full shrink-0", CONVERSATION_TAIL_SPACE_CLASS)}
          />
        </ConversationContent>
      ) : (
        <EmptyConversationState />
      )}

      <ConversationScrollButton className="bottom-28" />
    </Conversation>
  );
}
