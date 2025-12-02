"use client";

import { format } from "date-fns";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Flashcard } from "@/types/flashcard";

interface FlashcardPreviewCardProps {
  flashcard: Flashcard;
  index: number;
  canEdit: boolean;
}

export function FlashcardPreviewCard({
  flashcard,
  index,
  canEdit,
}: FlashcardPreviewCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-medium">
            Card #{index + 1}
          </CardTitle>
          <Badge variant="secondary" className="text-xs capitalize shrink-0">
            {flashcard.type.replace("_", " ")}
          </Badge>
        </div>
        <CardDescription className="text-xs">
          {flashcard.question.length > 60
            ? `${flashcard.question.slice(0, 60)}...`
            : flashcard.question}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border bg-muted/50 p-3">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {flashcard.answer}
          </p>
        </div>
      </CardContent>
      <CardFooter className="border-t mt-auto items-center align-middle">
        <p className="text-xs text-muted-foreground flex-1 leading-none">
          Updated {format(new Date(flashcard.updated_at), "MMM d, yyyy")}
        </p>
        {canEdit && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-7">
                <MoreHorizontal className="size-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive focus:text-destructive">
                <Trash2 className="size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardFooter>
    </Card>
  );
}
