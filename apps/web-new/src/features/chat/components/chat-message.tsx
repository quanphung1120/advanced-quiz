import type { UIMessage } from "ai";
import { cn } from "@/utils/cn";
import { getMessageText } from "./chat-helpers";

function MessageLabel({ role }: { role: UIMessage["role"] }) {
  if (role === "user") {
    return "You";
  }

  if (role === "assistant") {
    return "Study Assistant";
  }

  return "System";
}

export function ChatMessage({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";
  const content = getMessageText(message);

  return (
    <article
      className={cn(
        "border-t border-border/60 py-5",
        isUser && "ml-auto max-w-[82%]",
      )}
    >
      <div
        className={cn(
          "space-y-3",
          isUser
            ? "text-right"
            : "text-left",
        )}
      >
        <div
          className={cn(
            "flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em]",
            isUser ? "justify-end text-muted-foreground" : "text-muted-foreground",
          )}
        >
          <MessageLabel role={message.role} />
        </div>
        <div
          className={cn(
            "space-y-3 border-l px-4 text-sm leading-7",
            isUser
              ? "border-foreground/70 text-foreground"
              : "border-border text-foreground/90",
          )}
        >
          {content
            ? content.split("\n").map((paragraph, index) => (
              <p key={`${message.id}-${index}`}>{paragraph}</p>
            ))
            : null}
        </div>
      </div>
    </article>
  );
}
