"use client";

import Link from "next/link";
import Image from "next/image";
import {
  BookOpenIcon,
  MoreHorizontalIcon,
  PencilIcon,
  TrashIcon,
  FolderIcon,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Collection } from "@/types/collection";
import { EditCollectionDialog } from "./edit-collection-dialog";
import { DeleteCollectionDialog } from "./delete-collection-dialog";

interface CollectionCardProps {
  collection: Collection;
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

  return (
    <>
      <Card className="group relative transition-colors hover:border-primary/50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
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

        <CardHeader>
          <CardTitle className="line-clamp-1 text-base pr-8">
            {collection.name}
          </CardTitle>
          <CardDescription className="line-clamp-2">
            {collection.description || "No description"}
          </CardDescription>
        </CardHeader>

        {collection.image || imageError ? (
          <div className="px-6 pb-4">
            {collection.image && !imageError ? (
              <div className="relative w-full h-32 rounded-md overflow-hidden">
                <Image
                  src={collection.image}
                  alt={collection.name}
                  fill
                  className="object-cover"
                  onError={() => setImageError(true)}
                />
              </div>
            ) : (
              <div className="w-full h-32 bg-muted flex items-center justify-center rounded-md">
                <FolderIcon className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>
        ) : null}

        <CardContent>
          <p className="text-sm text-muted-foreground">
            Updated: {formatDate(collection.updated_at)}
          </p>
        </CardContent>
        <CardFooter>
          <Button size="sm" className="w-full" asChild>
            <Link href={`/dashboard/collections/${collection.id}`}>
              <BookOpenIcon className="h-4 w-4" />
              Study
            </Link>
          </Button>
        </CardFooter>
      </Card>

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
