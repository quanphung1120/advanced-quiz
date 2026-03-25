import { useEffect, useEffectEvent, useRef, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useChat } from "@ai-sdk/react";
import { useQueryClient } from "@tanstack/react-query";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Button } from "@advanced-quiz/ui/components/button";
import { useSidebar } from "@advanced-quiz/ui/components/sidebar";
import { LoadingState } from "@/components/loading-state";
import { chatApi } from "../api/chat-api";
import { useChatSession } from "../hooks/use-chat-sessions";
import type { GetChatSessionResponse } from "../types/chat";
import { ChatConversation } from "./chat-conversation";
import { getSessionPreview } from "./chat-helpers";
import { ChatPromptInput } from "./chat-prompt-input";

const starterPrompts = [
  "Turn this chapter into 10 active-recall quiz questions.",
  "Summarize photosynthesis like I need to teach it tomorrow.",
  "Rewrite my notes into clean flashcards with one fact per card.",
  "Build a 20-minute study plan from these weak topics.",
];

function ThreadCanvas({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={[
        "flex min-h-0 flex-1 flex-col bg-background",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </section>
  );
}

// The composer dock height – keep in sync with the inner dock padding and
// compact prompt input sizing.
const COMPOSER_DOCK_HEIGHT = "6.5rem";
// Width of the sidebar when expanded (must match SIDEBAR_WIDTH in sidebar.tsx).
const SIDEBAR_EXPANDED_WIDTH = "16rem";

function ComposerDock({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  // When the sidebar is using "offcanvas" collapse mode it slides fully off
  // screen, so the effective layout left-edge is 0. When expanded, it's the
  // sidebar width. We read the sidebar state here and transition the `left`
  // offset to match so the dock always spans the full content area.
  const { open, isMobile } = useSidebar();
  const sidebarLeft = !isMobile && open ? SIDEBAR_EXPANDED_WIDTH : "0px";

  return (
    <div
      className={[
        "fixed bottom-0 z-10 border-t border-border/70 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        left: sidebarLeft,
        right: 0,
        transition: "left 200ms ease-linear",
      }}
    >
      <div className="mx-auto w-full max-w-4xl px-5 py-3 sm:px-8 lg:px-10">
        {children}
      </div>
    </div>
  );
}

/** Spacer that prevents messages from being hidden behind the fixed ComposerDock. */
function ComposerSpacer() {
  return <div style={{ height: COMPOSER_DOCK_HEIGHT, flexShrink: 0 }} />;
}

function ChatThreadSkeleton() {
  return (
    <ThreadCanvas>
      <LoadingState className="flex-1 px-5 py-8 sm:px-8 lg:px-10" />
    </ThreadCanvas>
  );
}

/**
 * Shown when there is no active session. Uses a custom transport so that the
 * very first message creates the session server-side and starts streaming –
 * no empty sessions are ever written to the database.
 */
function NewChatThread() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [pendingSessionId, setPendingSessionId] = useState<string | null>(null);

  const chat = useChat({
    transport: new DefaultChatTransport<UIMessage>({
      api: chatApi.buildFirstMessageStreamUrl(),
      credentials: "include",
      prepareSendMessagesRequest({ messages }) {
        const message = messages.at(-1);

        if (!message) {
          throw new Error("Cannot send an empty draft message.");
        }

        return {
          body: {
            message,
          },
        };
      },
      fetch: async (input, init) => {
        const response = await fetch(input, init);
        const sessionId = response.headers.get("X-Session-Id");
        if (sessionId) {
          setPendingSessionId(sessionId);
        }
        return response;
      },
    }),
    onFinish: async () => {
      if (!pendingSessionId) return;

      queryClient.invalidateQueries({ queryKey: ["chat", "sessions"] });

      navigate(`/dashboard/chat/${pendingSessionId}`, {
        replace: true,
        state: null,
      });
    },
  });

  const handlePromptClick = async (prompt: string) => {
    await chat.sendMessage({ text: prompt });
  };

  const hasMessages = chat.messages.length > 0;
  const isStreaming = chat.status === "streaming" || chat.status === "submitted";

  return (
    <ThreadCanvas>
      {hasMessages ? (
        <ChatConversation
          messages={chat.messages}
          isStreaming={isStreaming}
          title="New chat"
          preview={null}
        />
      ) : (
        <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-5 py-8 sm:px-8 lg:px-10">
          <section className="flex-1 py-6">
            <div className="space-y-3">
              <h2 className="text-lg font-medium tracking-tight">
                Suggested prompts
              </h2>
              <div className="overflow-hidden border border-border">
                {starterPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => {
                      void handlePromptClick(prompt);
                    }}
                    disabled={isStreaming}
                    className="w-full border-b border-border px-4 py-4 text-left text-sm leading-6 text-foreground transition-colors last:border-b-0 hover:bg-accent/35 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </section>
          <ComposerSpacer />
        </div>
      )}

      <ComposerDock>
        {chat.error ? (
          <div className="mb-3 border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {chat.error.message ||
              "Failed to send message. Please try again."}
          </div>
        ) : null}

        <ChatPromptInput
          status={chat.status}
          onStop={() => {
            void chat.stop();
          }}
          onSubmit={async (value) => {
            await chat.sendMessage({ text: value });
          }}
        />
      </ComposerDock>
    </ThreadCanvas>
  );
}

function SessionUnavailable() {
  return (
    <ThreadCanvas>
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-5 py-20 sm:px-8 lg:px-10">
        <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Session unavailable
        </h2>
        <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
          This thread could not be loaded. It may have been deleted, or your
          access to it may have expired.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-8 w-fit"
          render={<Link to="/dashboard/chat" />}
        >
          Open a new chat
        </Button>
      </div>
    </ThreadCanvas>
  );
}

type ChatLocationState = {
  initialPrompt?: string;
};

export function ChatThread({ sessionId }: { sessionId?: string }) {
  if (!sessionId) {
    return <NewChatThread />;
  }

  return <LoadedChatThread key={sessionId} sessionId={sessionId} />;
}

function LoadedChatThread({ sessionId }: { sessionId: string }) {
  const sessionQuery = useChatSession(sessionId);
  const location = useLocation();
  const locationState = (location.state as ChatLocationState | null) ?? null;

  if (sessionQuery.isPending) {
    return <ChatThreadSkeleton />;
  }

  if (!sessionQuery.data?.session) {
    return <SessionUnavailable />;
  }

  return (
    <ActiveChatThread
      sessionId={sessionId}
      initialMessages={sessionQuery.data.session.messages}
      title={sessionQuery.data.session.title}
      preview={sessionQuery.data.session.preview}
      initialPrompt={locationState?.initialPrompt}
    />
  );
}

function ActiveChatThread({
  sessionId,
  initialMessages,
  title,
  preview,
  initialPrompt,
}: {
  sessionId: string;
  initialMessages: UIMessage[];
  title: string;
  preview: string | null;
  initialPrompt?: string;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const submittedInitialPrompt = useRef<string | null>(null);

  const chat = useChat({
    id: sessionId,
    messages: initialMessages,
    transport: new DefaultChatTransport<UIMessage>({
      api: chatApi.buildStreamUrl(sessionId),
      credentials: "include",
      prepareSendMessagesRequest({ messages }) {
        const message = messages.at(-1);

        if (!message) {
          throw new Error("Cannot send an empty chat message.");
        }

        return {
          body: {
            message,
          },
        };
      },
    }),
    onFinish: async ({ messages }: { messages: UIMessage[] }) => {
      const latestMessage = messages.at(-1);
      if (!latestMessage) {
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["chat", "sessions"] }),
        queryClient.invalidateQueries({
          queryKey: ["chat", "sessions", sessionId],
        }),
      ]);
      queryClient.setQueryData(
        ["chat", "sessions", sessionId],
        (current: GetChatSessionResponse | undefined) =>
          current
            ? {
              ...current,
              session: {
                ...current.session,
                messages,
                preview: getSessionPreview(latestMessage),
              },
            }
            : current,
      );
    },
  });

  const sendInitialPrompt = useEffectEvent(async (value: string) => {
    await chat.sendMessage({ text: value });
    navigate(`/dashboard/chat/${sessionId}`, { replace: true, state: null });
  });

  useEffect(() => {
    if (!initialPrompt || submittedInitialPrompt.current === initialPrompt) {
      return;
    }

    submittedInitialPrompt.current = initialPrompt;
    void sendInitialPrompt(initialPrompt);
  }, [initialPrompt]);

  return (
    <ThreadCanvas>
      <ChatConversation
        messages={chat.messages}
        isStreaming={chat.status === "streaming" || chat.status === "submitted"}
        title={title}
        preview={preview}
      />

      <ComposerDock>
        {chat.error ? (
          <div className="mb-3 border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {chat.error.message ||
              "The assistant response failed. Retry the message or open a new thread."}
          </div>
        ) : null}

        <ChatPromptInput
          status={chat.status}
          onStop={() => {
            void chat.stop();
          }}
          onSubmit={async (value) => {
            await chat.sendMessage({ text: value });
          }}
        />
      </ComposerDock>
    </ThreadCanvas>
  );
}
