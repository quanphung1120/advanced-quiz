import Link from "next/link";
import {
  ChevronLeft,
  RotateCcw,
  Clock,
  BookOpen,
  TrendingUp,
  CheckCircle2,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { FlipCard } from "@/features/flashcards/components/flip-card";
import { RatingButtons } from "@/features/flashcards/components/rating-buttons";
import {
  type FlashcardReview,
  type ReviewRating,
  type CollectionStats,
  STATUS_LABELS,
  STATUS_COLORS,
  formatInterval,
} from "@/features/flashcards/lib/srs";

interface SRSLearningViewProps {
  collectionId: string;
  collectionName: string;

  // State from hook
  isLoading: boolean;
  hasCards: boolean;
  isSessionComplete: boolean;
  isStartingSession: boolean;
  isSubmitting: boolean;
  isFlipped: boolean;
  currentIndex: number;
  reviewedCount: number;

  // Data from hook
  reviews: FlashcardReview[];
  currentReview?: FlashcardReview;
  stats: CollectionStats | null;

  // Actions from hook
  onStartSession: () => void;
  onFlip: () => void;
  onRate: (rating: ReviewRating) => void;
  onReset: () => void;
}

export function SRSLearningView({
  collectionId,
  collectionName,
  isLoading,
  hasCards,
  isSessionComplete,
  isStartingSession,
  isSubmitting,
  isFlipped,
  currentIndex,
  reviewedCount,
  reviews,
  currentReview,
  stats,
  onStartSession,
  onFlip,
  onRate,
  onReset,
}: SRSLearningViewProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="size-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">
            Loading your learning session...
          </p>
        </div>
      </div>
    );
  }

  // Empty state - no cards initialized yet
  if (!hasCards && !isSessionComplete) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header
          collectionId={collectionId}
          collectionName={collectionName}
          stats={stats}
        />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md space-y-6">
            <div className="mx-auto size-16 rounded-full bg-muted flex items-center justify-center">
              <BookOpen className="size-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Start Learning</h2>
              <p className="text-muted-foreground">
                Initialize your learning session to start reviewing flashcards
                with spaced repetition.
              </p>
            </div>
            <Button
              onClick={onStartSession}
              disabled={isStartingSession}
              size="lg"
            >
              {isStartingSession ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Starting...
                </>
              ) : (
                "Start Session"
              )}
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Session complete state
  if (isSessionComplete) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header
          collectionId={collectionId}
          collectionName={collectionName}
          stats={stats}
        />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md space-y-6">
            <div className="mx-auto size-16 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="size-8 text-green-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Session Complete! 🎉</h2>
              <p className="text-muted-foreground">
                You reviewed {reviewedCount} card
                {reviewedCount !== 1 ? "s" : ""} in this session.
              </p>
            </div>
            {stats && (
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 rounded-lg bg-muted">
                  <div className="text-2xl font-bold">{stats.due_cards}</div>
                  <div className="text-sm text-muted-foreground">Still Due</div>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <div className="text-2xl font-bold">{stats.mature_cards}</div>
                  <div className="text-sm text-muted-foreground">Mature</div>
                </div>
              </div>
            )}
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={onReset}>
                <RotateCcw className="size-4 mr-2" />
                Review Again
              </Button>
              <Button asChild>
                <Link href={`/dashboard/collections/${collectionId}`}>
                  Back to Collection
                </Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Active learning state
  const progressPercent = hasCards
    ? ((currentIndex + 1) / reviews.length) * 100
    : 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Subtle Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-4 top-20 h-48 w-48 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -right-4 top-40 h-64 w-64 rounded-full bg-primary/3 blur-3xl" />
        <div className="absolute bottom-20 left-1/3 h-48 w-48 rounded-full bg-accent/20 blur-3xl" />
      </div>

      <Header
        collectionId={collectionId}
        collectionName={collectionName}
        stats={stats}
        onReset={onReset}
      />

      {/* Main content */}
      <main className="relative flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl space-y-6">
          {/* Progress indicator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Card {currentIndex + 1} of {reviews.length}
              </span>
              <div className="flex items-center gap-3">
                {currentReview && (
                  <Badge
                    variant="secondary"
                    className={STATUS_COLORS[currentReview.status]}
                  >
                    {STATUS_LABELS[currentReview.status]}
                  </Badge>
                )}
                <span className="text-muted-foreground">
                  {reviewedCount} reviewed
                </span>
              </div>
            </div>
            <Progress value={progressPercent} className="h-1.5" />
          </div>

          {/* Card info */}
          {currentReview && (
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="size-3" />
                Interval: {formatInterval(currentReview.interval)}
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp className="size-3" />
                Ease: {(currentReview.ease_factor * 100).toFixed(0)}%
              </span>
              <span>Reviews: {currentReview.review_count}</span>
            </div>
          )}

          {/* Flashcard */}
          {currentReview?.flashcard && (
            <FlipCard
              front={currentReview.flashcard.question}
              back={currentReview.flashcard.answer}
              isFlipped={isFlipped}
              onFlip={onFlip}
              className="h-80 w-full"
            />
          )}

          {/* Rating buttons or flip hint */}
          {isFlipped ? (
            <RatingButtons
              currentInterval={currentReview?.interval ?? 0}
              easeFactor={currentReview?.ease_factor ?? 2.5}
              status={currentReview?.status ?? "new"}
              onRate={onRate}
              isSubmitting={isSubmitting}
            />
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              Click the card or press{" "}
              <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs">
                Space
              </kbd>{" "}
              to reveal the answer
            </p>
          )}
        </div>
      </main>

      {/* Footer with keyboard hints */}
      <footer className="relative border-t border-border/50 bg-background/80 py-4 backdrop-blur-sm">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">
                Space
              </kbd>
              <span>Flip</span>
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">1</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">2</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">3</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">4</kbd>
              <span>Rate</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Header component
function Header({
  collectionId,
  collectionName,
  stats,
  onReset,
}: {
  collectionId: string;
  collectionName: string;
  stats: CollectionStats | null;
  onReset?: () => void;
}) {
  return (
    <header className="relative border-b border-border/50 bg-background/80 backdrop-blur-sm">
      <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link
              href={`/dashboard/collections/${collectionId}`}
              prefetch={false}
            >
              <ChevronLeft className="size-5" />
              <span className="sr-only">Back to collection</span>
            </Link>
          </Button>
          <div>
            <h1 className="font-semibold">{collectionName}</h1>
            <p className="text-sm text-muted-foreground">
              Spaced Repetition Mode
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {stats && (
            <div className="hidden sm:flex items-center gap-3 text-sm">
              <span className="text-blue-500">{stats.new_cards} new</span>
              <span className="text-orange-500">
                {stats.learning_cards} learn
              </span>
              <span className="text-green-500">
                {stats.review_cards} review
              </span>
            </div>
          )}
          {onReset && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="text-muted-foreground"
            >
              <RotateCcw className="size-4" />
              Refresh
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
