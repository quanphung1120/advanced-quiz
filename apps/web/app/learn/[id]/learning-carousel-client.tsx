"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ChevronLeft, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FlipCard } from "@/features/flashcards/components/flip-card";
import { Flashcard } from "@/types/flashcard";

interface LearningCarouselClientProps {
  collectionId: string;
  collectionName: string;
  flashcards: Flashcard[];
}

interface LearningProgress {
  currentIndex: number;
  flippedCards: string[];
}

const STORAGE_KEY_PREFIX = "learn-progress-";

function getStorageKey(collectionId: string): string {
  return `${STORAGE_KEY_PREFIX}${collectionId}`;
}

function loadProgress(collectionId: string): LearningProgress | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(getStorageKey(collectionId));
    if (stored) {
      return JSON.parse(stored) as LearningProgress;
    }
  } catch (error) {
    console.error("Failed to load learning progress:", error);
  }
  return null;
}

function saveProgress(collectionId: string, progress: LearningProgress): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(getStorageKey(collectionId), JSON.stringify(progress));
  } catch (error) {
    console.error("Failed to save learning progress:", error);
  }
}

export function LearningCarouselClient({
  collectionId,
  collectionName,
  flashcards,
}: LearningCarouselClientProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isFlipped, setIsFlipped] = React.useState(false);
  const [flippedCards, setFlippedCards] = React.useState<Set<string>>(
    new Set()
  );
  const [isLoaded, setIsLoaded] = React.useState(false);

  const currentCard = flashcards[currentIndex];
  const progressPercent = ((currentIndex + 1) / flashcards.length) * 100;
  const hasViewedCurrent = flippedCards.has(currentCard?.id);

  const goToNext = React.useCallback(() => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    }
  }, [currentIndex, flashcards.length]);

  const goToPrevious = React.useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
    }
  }, [currentIndex]);

  const toggleFlip = React.useCallback(() => {
    setIsFlipped((prev) => !prev);
    if (!isFlipped && currentCard) {
      setFlippedCards((prev) => new Set(prev).add(currentCard.id));
    }
  }, [isFlipped, currentCard]);

  const resetProgress = React.useCallback(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setFlippedCards(new Set());
  }, []);

  // Load progress from localStorage on mount
  React.useEffect(() => {
    const savedProgress = loadProgress(collectionId);
    if (savedProgress) {
      setCurrentIndex(
        Math.min(savedProgress.currentIndex, flashcards.length - 1)
      );
      setFlippedCards(new Set(savedProgress.flippedCards));
    }
    setIsLoaded(true);
  }, [collectionId, flashcards.length]);

  // Save progress to localStorage whenever it changes
  React.useEffect(() => {
    if (!isLoaded) return;

    saveProgress(collectionId, {
      currentIndex,
      flippedCards: Array.from(flippedCards),
    });
  }, [collectionId, currentIndex, flippedCards, isLoaded]);

  // Keyboard navigation
  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          goToPrevious();
          break;
        case "ArrowRight":
          event.preventDefault();
          goToNext();
          break;
        case " ":
        case "Enter":
          event.preventDefault();
          toggleFlip();
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToPrevious, goToNext, toggleFlip]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/dashboard/collections/${collectionId}`}>
                <ChevronLeft className="size-5" />
                <span className="sr-only">Back to collection</span>
              </Link>
            </Button>
            <div>
              <h1 className="font-semibold">{collectionName}</h1>
              <p className="text-sm text-muted-foreground">Learning Mode</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetProgress}
            className="text-muted-foreground"
          >
            <RotateCcw className="size-4" />
            Reset
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl space-y-8">
          {/* Progress indicator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Card {currentIndex + 1} of {flashcards.length}
              </span>
              <span className="text-muted-foreground">
                {flippedCards.size} viewed
              </span>
            </div>
            <Progress value={progressPercent} className="h-1.5" />
          </div>

          {/* Flashcard */}
          <FlipCard
            front={currentCard?.question}
            back={currentCard?.answer}
            isFlipped={isFlipped}
            onFlip={toggleFlip}
            className="h-80 w-full"
          />

          {/* Hint */}
          <p className="text-center text-sm text-muted-foreground">
            {isFlipped
              ? "Click to show the question"
              : "Click the card to reveal the answer"}
          </p>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              onClick={goToPrevious}
              disabled={currentIndex === 0}
              className="gap-2"
            >
              <ArrowLeft className="size-4" />
              Previous
            </Button>
            <Button
              onClick={goToNext}
              disabled={currentIndex === flashcards.length - 1}
              className="gap-2"
            >
              Next
              <ArrowRight className="size-4" />
            </Button>
          </div>

          {/* Completion state */}
          {currentIndex === flashcards.length - 1 && hasViewedCurrent && (
            <div className="text-center space-y-4 pt-4">
              <p className="text-muted-foreground">
                🎉 You&apos;ve reviewed all the cards!
              </p>
              <Button variant="outline" onClick={resetProgress}>
                Start Over
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Footer with keyboard hints */}
      <footer className="border-t py-4">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">←</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">→</kbd>
              <span>Navigate</span>
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">
                Space
              </kbd>
              <span>Flip card</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
