import { Link } from "react-router";
import {
  ArrowRight,
  Clock3,
  Globe2,
  LockKeyhole,
  Sparkles,
} from "lucide-react";
import type { Collection } from "@/features/collections/api/collections-api";

type CollectionCardProps = {
  collection: Collection;
};

export function CollectionCard({ collection }: CollectionCardProps) {
  return (
    <Link
      to={`/dashboard/collections/${collection.id}`}
      className="group flex h-full flex-col rounded-sm border-2 border-border bg-muted p-5 transition-colors hover:border-foreground/30"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary/10 text-primary border border-primary/20">
          <Sparkles className="h-4.5 w-4.5" />
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/30 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {collection.isPublic ? (
            <Globe2 className="h-3 w-3" />
          ) : (
            <LockKeyhole className="h-3 w-3" />
          )}
          {collection.isPublic ? "Public" : "Private"}
        </span>
      </div>

      <div className="mt-6 space-y-2">
        <h4 className="font-display text-xl font-bold tracking-tight text-foreground">
          {collection.name}
        </h4>
        <p className="line-clamp-2 min-h-[2.5rem] text-sm leading-relaxed text-muted-foreground/80">
          {collection.description ||
            "No description yet. Open the detail page to shape this deck."}
        </p>
      </div>

      <div className="mt-auto pt-5">
        <div className="flex items-center justify-between border-t border-border/60 pt-4">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
            <Clock3 className="h-3.5 w-3.5" />
            {new Date(collection.updatedAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground">
            Open
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}
