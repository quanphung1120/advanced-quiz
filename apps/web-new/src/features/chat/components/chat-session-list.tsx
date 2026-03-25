import { Link } from "react-router";
import { ScrollArea } from "@advanced-quiz/ui/components/scroll-area";
import { LoadingState } from "@/components/loading-state";
import { cn } from "@/utils/cn";
import type { ChatSessionSummary } from "../types/chat";

function SessionListSkeleton() {
  return (
    <LoadingState
      className="min-h-40"
      spinnerClassName="size-10 text-sidebar-foreground/70"
    />
  );
}

function sortSessionsByUpdatedAt(sessions: ChatSessionSummary[]) {
  return [...sessions].sort(
    (left, right) =>
      new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
  );
}

export function ChatSessionList({
  isPending,
  sessions,
  activeSessionId,
  limit = 5,
}: {
  isPending: boolean;
  sessions: ChatSessionSummary[];
  activeSessionId?: string;
  limit?: number;
}) {
  const visibleSessions = sortSessionsByUpdatedAt(sessions).slice(0, limit);

  return (
    <ScrollArea className="min-h-0 flex-1">
      <div className="space-y-1 px-2 pb-2">
        {isPending ? (
          <SessionListSkeleton />
        ) : visibleSessions.length > 0 ? (
          <div className="space-y-1">
            {visibleSessions.map((session) => {
              const isActive = session.id === activeSessionId;

              return (
                <Link
                  key={session.id}
                  to={`/dashboard/chat/${session.id}`}
                  className={cn(
                    "block px-2 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
                  )}
                >
                  <p className="truncate font-medium">
                    {session.title || "Untitled session"}
                  </p>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="px-2 py-3 text-sm text-sidebar-foreground/70">
            No sessions yet.
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
