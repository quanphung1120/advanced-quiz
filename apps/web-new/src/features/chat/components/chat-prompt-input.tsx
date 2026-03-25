import type { ChatStatus } from "ai";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@advanced-quiz/ui/components/ai-elements/prompt-input";
import { cn } from "@/utils/cn";

export function ChatPromptInput({
  status,
  onStop,
  onSubmit,
  className,
  placeholder = "Message the study assistant...",
}: {
  status: ChatStatus;
  onStop: () => void;
  onSubmit: (value: string) => Promise<void>;
  className?: string;
  placeholder?: string;
}) {
  return (
    <PromptInput
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-background p-0 shadow-none",
        className,
      )}
      onSubmit={async ({ text }) => {
        const nextValue = text.trim();
        if (
          !nextValue ||
          status === "submitted" ||
          status === "streaming"
        ) {
          return;
        }

        await onSubmit(nextValue);
      }}
    >
      <PromptInputBody>
        <PromptInputTextarea
          className="min-h-[72px] border-none bg-transparent px-3 py-2.5 text-sm leading-6 shadow-none focus-visible:ring-0"
          placeholder={placeholder}
        />
      </PromptInputBody>

      <PromptInputFooter className="mt-0 items-center border-t border-border/70 px-3 py-1.5">
        <PromptInputTools>
          <p className="hidden text-xs text-muted-foreground sm:block">
            Enter to send. Shift + Enter for a new line.
          </p>
        </PromptInputTools>

        <PromptInputSubmit
          className="h-9 px-4"
          onStop={onStop}
          status={status}
        />
      </PromptInputFooter>
    </PromptInput>
  );
}
