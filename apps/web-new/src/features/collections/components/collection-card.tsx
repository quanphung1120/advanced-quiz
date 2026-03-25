import { Link } from "react-router";
import { ArrowUpRight, Globe2, LockKeyhole } from "lucide-react";
import { Badge } from "@advanced-quiz/ui/components/badge";
import type { Collection } from "@/features/collections/types/collection";

type CollectionCardProps = {
  collection: Collection;
  scope?: "owned" | "shared";
  isLast?: boolean;
};

function formatShortDate(dateString: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(new Date(dateString));
}

export function CollectionCard({
  collection,
  scope = "owned",
  isLast = false,
}: CollectionCardProps) {
  return (
    <Link
      to={`/dashboard/collections/${collection.id}`}
      className="group block"
    >
      <article
        className={`grid gap-4 px-4 py-4 transition-colors group-hover:bg-muted/20 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-5 ${
          isLast ? "" : "border-b border-border"
        }`}
      >
        <div className="min-w-0 space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{scope}</Badge>
            <Badge variant={collection.isPublic ? "secondary" : "outline"}>
              {collection.isPublic ? (
                <Globe2 data-icon="inline-start" />
              ) : (
                <LockKeyhole data-icon="inline-start" />
              )}
              {collection.isPublic ? "Public" : "Private"}
            </Badge>
          </div>

          <div className="space-y-1">
            <h3 className="truncate text-sm font-medium text-foreground">
              {collection.name}
            </h3>
            <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
              {collection.description ||
                "No description yet. Open the collection to add structure and study context."}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 sm:justify-end">
          <div className="text-left sm:text-right">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Updated
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {formatShortDate(collection.updatedAt)}
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-foreground transition-transform group-hover:translate-x-0.5">
            Open
            <ArrowUpRight />
          </span>
        </div>
      </article>
    </Link>
  );
}
