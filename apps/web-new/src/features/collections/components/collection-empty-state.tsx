import { Layers3, Plus, Search } from "lucide-react";
import { Button } from "@advanced-quiz/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@advanced-quiz/ui/components/empty";

type CollectionEmptyStateProps = {
  hasSearch: boolean;
  onCreate: () => void;
  compact?: boolean;
};

export function CollectionEmptyState({
  hasSearch,
  onCreate,
  compact = false,
}: CollectionEmptyStateProps) {
  return (
    <Empty
      className={`border border-dashed border-border bg-card/50 ${
        compact ? "min-h-[240px] py-10" : "min-h-[400px] py-16"
      }`}
    >
      <EmptyHeader>
        <EmptyMedia variant="icon">
          {hasSearch ? <Search /> : <Layers3 />}
        </EmptyMedia>
        <EmptyTitle>
          {hasSearch ? "No matching collections" : "No collections yet"}
        </EmptyTitle>
        <EmptyDescription>
          {hasSearch
            ? "Try a broader query or switch ownership filters to surface more results."
            : "Create your first collection to start organising decks, collaborators, and study sessions from one workspace."}
        </EmptyDescription>
      </EmptyHeader>

      {!hasSearch ? (
        <EmptyContent>
          <Button onClick={onCreate}>
            <Plus data-icon="inline-start" />
            Create collection
          </Button>
        </EmptyContent>
      ) : null}
    </Empty>
  );
}
