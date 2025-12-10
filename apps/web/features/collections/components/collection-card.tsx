"use client";

import Link from "next/link";
import Image from "next/image";
import {
  BookOpenIcon,
  MoreHorizontalIcon,
  PencilIcon,
  TrashIcon,
  LayersIcon,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Collection } from "../service/api";
import { EditCollectionDialog } from "./edit-collection-dialog";
import { DeleteCollectionDialog } from "./delete-collection-dialog";

interface CollectionCardProps {
  collection: Collection;
}

// Kahoot-style color palette
const KAHOOT_COLORS = [
  { bg: "from-[#e21b3c] to-[#c41230]", accent: "#e21b3c" }, // Red
  { bg: "from-[#1368ce] to-[#0d52a6]", accent: "#1368ce" }, // Blue
  { bg: "from-[#d89e00] to-[#b88400]", accent: "#d89e00" }, // Gold/Yellow
  { bg: "from-[#26890c] to-[#1e6b09]", accent: "#26890c" }, // Green
  { bg: "from-[#9c27b0] to-[#7b1fa2]", accent: "#9c27b0" }, // Purple
  { bg: "from-[#00bcd4] to-[#0097a7]", accent: "#00bcd4" }, // Cyan
];

function getColorFromId(id: string) {
  // Generate a consistent color based on collection ID
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return KAHOOT_COLORS[Math.abs(hash) % KAHOOT_COLORS.length];
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = diffInMs / (1000 * 60 * 60);
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

  if (diffInHours < 1) {
    return "Just now";
  } else if (diffInHours < 24) {
    const hours = Math.floor(diffInHours);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else if (diffInDays < 7) {
    const days = Math.floor(diffInDays);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  }
}

export function CollectionCard({ collection }: CollectionCardProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [imageError, setImageError] = useState(false);

  const color = getColorFromId(collection.id);

  return (
    <>
      <div className="group relative">
        {/* Kahoot-style card with bold gradient and playful design */}
        <div className="relative overflow-hidden rounded-2xl border border-border shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          {/* Gradient Header */}
          <div className={`relative h-32 bg-linear-to-br ${color.bg}`}>
            {/* Decorative shapes - Kahoot style */}
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
            <div className="absolute -bottom-6 -left-6 h-20 w-20 rounded-full bg-black/10" />
            <div className="absolute bottom-4 right-4 h-12 w-12 rotate-12 rounded-lg bg-white/10" />

            {/* Image overlay if exists */}
            {collection.image && !imageError ? (
              <div className="absolute inset-0">
                <Image
                  src={collection.image}
                  alt={collection.name}
                  fill
                  className="object-cover mix-blend-overlay opacity-40"
                  onError={() => setImageError(true)}
                />
              </div>
            ) : null}

            {/* Icon */}
            <div className="absolute left-4 top-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <LayersIcon className="h-5 w-5 text-white" />
              </div>
            </div>

            {/* More options button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="absolute right-2 top-2 text-white/70 opacity-0 transition-all hover:bg-white/20 hover:text-white group-hover:opacity-100"
                >
                  <MoreHorizontalIcon className="h-4 w-4" />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                  <PencilIcon className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <TrashIcon className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Content Section */}
          <div className="bg-card p-4">
            <h3 className="mb-1 line-clamp-1 text-lg font-bold">
              {collection.name}
            </h3>
            <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
              {collection.description || "No description"}
            </p>

            {/* Footer with date and action */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">
                {formatDate(collection.updated_at)}
              </span>
              <Button
                size="sm"
                className="gap-1.5 rounded-full font-semibold shadow-md transition-transform hover:scale-105"
                style={{ backgroundColor: color.accent }}
                asChild
              >
                <Link
                  href={`/dashboard/collections/${collection.id}`}
                  prefetch={false}
                >
                  <BookOpenIcon className="h-3.5 w-3.5" />
                  Study
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <EditCollectionDialog
        collection={collection}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />

      <DeleteCollectionDialog
        collection={collection}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />
    </>
  );
}
