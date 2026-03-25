import { formatDistanceToNow } from "date-fns";
import { MoreVertical, Trash2 } from "lucide-react";
import { startTransition, useMemo, useState } from "react";
import { Link } from "react-router";
import { Button } from "@advanced-quiz/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@advanced-quiz/ui/components/dropdown-menu";
import {
  InputGroup,
  InputGroupInput,
} from "@advanced-quiz/ui/components/input-group";
import { LoadingState } from "@/components/loading-state";
import {
  useChatSessions,
  useDeleteChatSession,
} from "../hooks/use-chat-sessions";
import type { ChatSessionSummary } from "../types/chat";

const EMPTY_SESSIONS: ChatSessionSummary[] = [];

function sortSessionsByUpdatedAt(sessions: ChatSessionSummary[]) {
  return [...sessions].sort(
    (left, right) =>
      new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
  );
}

function matchesSearch(query: string, session: ChatSessionSummary) {
  if (!query) {
    return true;
  }

  const haystack = [session.title, session.preview ?? ""]
    .join(" ")
    .trim()
    .toLowerCase();

  return haystack.includes(query);
}

function ChatSessionBrowserLoadingState() {
  return <LoadingState />;
}

function SessionActions({ session }: { session: ChatSessionSummary }) {
  const deleteSession = useDeleteChatSession();

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    deleteSession.mutate(session.id);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        onClick={(e) => e.stopPropagation()}
        className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        <MoreVertical className="h-4 w-4" />
        <span className="sr-only">Actions</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleDelete} variant="destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ChatSessionBrowser() {
  const [draftSearch, setDraftSearch] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const sessionsQuery = useChatSessions({ enabled: true });

  const sessions = useMemo(
    () =>
      sortSessionsByUpdatedAt(sessionsQuery.data?.sessions ?? EMPTY_SESSIONS),
    [sessionsQuery.data?.sessions],
  );

  const filteredSessions = useMemo(
    () => sessions.filter((session) => matchesSearch(searchValue, session)),
    [searchValue, sessions],
  );

  const hasSearch = Boolean(searchValue);

  if (sessionsQuery.isPending) {
    return <ChatSessionBrowserLoadingState />;
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      <section className="flex flex-col gap-5 border-b pb-6">
        <div className="space-y-2">
          <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Session list
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            Search the full chat history, reopen an existing thread, or start a
            clean session.
          </p>
        </div>

        <form
          className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"
          onSubmit={(event) => {
            event.preventDefault();
            startTransition(() => {
              setSearchValue(draftSearch.trim().toLowerCase());
            });
          }}
        >
          <InputGroup className="h-9 flex-1 lg:max-w-xl">
            <InputGroupInput
              value={draftSearch}
              onChange={(event) => {
                setDraftSearch(event.target.value);
              }}
              placeholder="Search sessions by title or preview"
            />
          </InputGroup>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" variant="outline">
              Search
            </Button>
            {hasSearch ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  startTransition(() => {
                    setDraftSearch("");
                    setSearchValue("");
                  });
                }}
              >
                Reset
              </Button>
            ) : null}
            <Button render={<Link to="/dashboard/chat/new" />}>New chat</Button>
          </div>
        </form>
      </section>

      {filteredSessions.length > 0 ? (
        <section className="overflow-hidden border border-border bg-card/40">
          {filteredSessions.map((session) => (
            <div
              key={session.id}
              className="group relative border-b border-border/70 last:border-b-0 hover:bg-accent/40"
            >
              <Link
                to={`/dashboard/chat/${session.id}`}
                className="block px-4 py-4 transition-colors"
              >
                <div className="flex flex-col gap-3">
                  <div className="min-w-0 pr-8">
                    <h2 className="truncate text-sm font-medium tracking-tight text-foreground">
                      {session.title || "Untitled session"}
                    </h2>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
                      {session.preview ||
                        "No preview is available yet for this session."}
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(session.updatedAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
              </Link>

              <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
                <SessionActions session={session} />
              </div>
            </div>
          ))}
        </section>
      ) : (
        <section className="border border-dashed border-border px-4 py-10">
          <div className="max-w-xl space-y-2">
            <h2 className="text-lg font-medium tracking-tight">
              {hasSearch ? "No sessions match your search" : "No sessions yet"}
            </h2>
            <p className="text-sm leading-6 text-muted-foreground">
              {hasSearch
                ? "Try a different phrase or reset the search to see your full session history."
                : "Start a new chat to build your first saved study thread."}
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
