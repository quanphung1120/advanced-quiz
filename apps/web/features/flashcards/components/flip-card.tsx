"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface FlipCardProps {
  front: React.ReactNode;
  back: React.ReactNode;
  isFlipped?: boolean;
  onFlip?: () => void;
  className?: string;
}

export function FlipCard({
  front,
  back,
  isFlipped = false,
  onFlip,
  className,
}: FlipCardProps) {
  return (
    <div
      className={cn("perspective-1000 cursor-pointer select-none", className)}
      onClick={onFlip}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onFlip?.();
        }
      }}
      role="button"
      tabIndex={0}
      aria-pressed={isFlipped}
      aria-label={isFlipped ? "Click to show question" : "Click to show answer"}
    >
      <div
        className={cn(
          "relative w-full h-full transition-transform duration-500 transform-style-preserve-3d",
          isFlipped && "rotate-y-180"
        )}
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          transition: "transform 0.5s ease-in-out",
        }}
      >
        {/* Front face */}
        <Card
          className={cn(
            "absolute inset-0 w-full h-full backface-hidden",
            "flex flex-col"
          )}
          style={{
            backfaceVisibility: "hidden",
          }}
        >
          <CardContent className="flex flex-1 items-center justify-center p-8">
            <div className="text-center">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-4 block">
                Question
              </span>
              <div className="text-lg font-medium leading-relaxed">{front}</div>
            </div>
          </CardContent>
        </Card>

        {/* Back face */}
        <Card
          className={cn(
            "absolute inset-0 w-full h-full",
            "flex flex-col bg-accent/30"
          )}
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <CardContent className="flex flex-1 items-center justify-center p-8">
            <div className="text-center">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-4 block">
                Answer
              </span>
              <div className="text-lg font-medium leading-relaxed">{back}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
