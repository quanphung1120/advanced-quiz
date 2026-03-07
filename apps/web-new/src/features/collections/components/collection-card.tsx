import { Link } from "react-router";
import {
  ArrowRight,
  Clock3,
  Globe2,
  LockKeyhole,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import type { Collection } from "@/features/collections/api/collections-api";

type CollectionCardProps = {
  collection: Collection;
};

export function CollectionCard({ collection }: CollectionCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="group h-full"
    >
      <Link
        to={`/dashboard/collections/${collection.id}`}
        className="flex h-full flex-col rounded-sm border border-border bg-card p-5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all hover:border-primary/50 hover:shadow-[0_12px_48px_oklch(0.88_0.28_111_/_0.2)] overflow-hidden relative"
      >
        {/* Subtle background glow on hover */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(0.88_0.28_111_/_0.05),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        <div className="flex items-start justify-between gap-4 relative z-10">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary/10 text-primary border border-primary/20">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/30 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground transition-colors group-hover:border-primary/20 group-hover:bg-primary/5 group-hover:text-primary/80">
            {collection.isPublic ? (
              <Globe2 className="h-3 w-3" />
            ) : (
              <LockKeyhole className="h-3 w-3" />
            )}
            {collection.isPublic ? "Public" : "Private"}
          </span>
        </div>

        <div className="mt-6 space-y-2 relative z-10">
          <h4 className="font-display text-xl font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
            {collection.name}
          </h4>
          <p className="line-clamp-2 min-h-[2.5rem] text-sm leading-relaxed text-muted-foreground/80">
            {collection.description ||
              "No description yet. Open the detail page to shape this deck."}
          </p>
        </div>

        <div className="mt-auto pt-5 relative z-10">
          <div className="flex items-center justify-between border-t border-border/60 pt-4">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
              <Clock3 className="h-3.5 w-3.5" />
              {new Date(collection.updatedAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground transition-all group-hover:text-primary group-hover:translate-x-0.5">
              Open
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
