"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import {
  type ReviewRating,
  type CardStatus,
  RATING,
  RATING_LABELS,
  formatInterval,
  estimateNextInterval,
} from "../lib/srs";

interface RatingButtonsProps {
  currentInterval: number;
  easeFactor: number;
  status: CardStatus;
  onRate: (rating: ReviewRating) => void | Promise<void>;
  isSubmitting: boolean;
  disabled?: boolean;
  className?: string;
}

export function RatingButtons({
  currentInterval,
  easeFactor,
  status,
  onRate,
  isSubmitting,
  disabled,
  className,
}: RatingButtonsProps) {
  const ratings: ReviewRating[] = [
    RATING.AGAIN,
    RATING.HARD,
    RATING.GOOD,
    RATING.EASY,
  ];

  const getButtonVariant = (rating: ReviewRating) => {
    switch (rating) {
      case RATING.AGAIN:
        return "destructive";
      case RATING.HARD:
        return "secondary";
      case RATING.GOOD:
        return "default";
      case RATING.EASY:
        return "outline";
      default:
        return "default";
    }
  };

  const handleClick = async (rating: ReviewRating) => {
    if (disabled || isSubmitting) return;
    await onRate(rating);
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <p className="text-center text-sm text-muted-foreground">
        How well did you recall this?
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {ratings.map((rating) => {
          const nextInterval = estimateNextInterval(
            currentInterval,
            easeFactor,
            status,
            rating
          );

          return (
            <Button
              key={rating}
              variant={getButtonVariant(rating)}
              size="sm"
              onClick={() => handleClick(rating)}
              disabled={disabled || isSubmitting}
              className="flex flex-col items-center gap-0.5 h-auto py-2 px-4 min-w-[70px]"
            >
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  <span className="font-medium">{RATING_LABELS[rating]}</span>
                  <span className="text-[10px] opacity-70">
                    {formatInterval(nextInterval)}
                  </span>
                </>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
