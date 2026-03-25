import { useEffect, useEffectEvent, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router";
import {
  ArrowLeft,
  ArrowRight,
  FlipHorizontal2,
  Loader2,
  Orbit,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  ChevronRight,
  BarChart3,
  Dna,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@advanced-quiz/ui/components/button";
import { LoadingState } from "@/components/loading-state";
import { useCollection } from "@/features/collections/hooks/use-collections";
import type { ReviewRating } from "@/features/reviews/types/review";
import { useSrsSession } from "@/features/reviews/hooks/use-srs-session";

const RATING_OPTIONS: Array<{
  value: ReviewRating;
  label: string;
  hint: string;
  accent: string;
}> = [
  {
    value: 0,
    label: "Again",
    hint: "Total failure",
    accent:
      "border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 active:scale-95",
  },
  {
    value: 1,
    label: "Hard",
    hint: "Barely recalled",
    accent:
      "border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 active:scale-95",
  },
  {
    value: 2,
    label: "Good",
    hint: "Solid recall",
    accent:
      "border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 active:scale-95 shadow-[0_0_20px_oklch(0.88_0.28_111_/_0.1)]",
  },
  {
    value: 3,
    label: "Easy",
    hint: "Instant recall",
    accent:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 active:scale-95",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

function formatInterval(minutes: number) {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  if (minutes < 1440) {
    return `${Math.round(minutes / 60)}h`;
  }
  const days = Math.round(minutes / 1440);
  if (days < 30) {
    return `${days}d`;
  }
  return `${Math.round(days / 30)}mo`;
}

function EmptyState({
  collectionId,
  title,
  description,
  actions,
}: {
  collectionId: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 relative overflow-hidden">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="max-w-3xl w-full rounded-sm border border-border bg-card p-10 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.6)] backdrop-blur-xl relative overflow-hidden sm:p-14"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -mr-32 -mt-32 pointer-events-none" />

        <div className="flex h-16 w-16 items-center justify-center rounded-sm bg-primary/10 border border-primary/20 text-primary shadow-[0_0_32px_oklch(0.88_0.28_111_/_0.2)]">
          <Orbit className="h-7 w-7" />
        </div>

        <div className="mt-10 space-y-6">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
              Execution State
            </p>
            <h1 className="font-display text-5xl font-black tracking-tight text-foreground sm:text-6xl">
              {title}
            </h1>
          </div>
          <p className="max-w-2xl text-lg leading-8 text-muted-foreground font-medium">
            {description}
          </p>
        </div>

        <div className="mt-12 flex flex-wrap gap-4 pt-10 border-t border-border/40">
          {actions}
          <Link
            to={`/dashboard/collections/${collectionId}`}
            className="inline-block"
          >
            <Button variant="outline" size="lg" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Return to Workspace
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export function SrsPage() {
  const { id } = useParams();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);

  const collectionQuery = useCollection(id ?? "");
  const srs = useSrsSession(id ?? "");

  const collection = collectionQuery.data?.collection;
  const dueCards = srs.dueCardsQuery.data ?? [];
  const allReviews = srs.allReviewsQuery.data ?? [];
  const stats = srs.statsQuery.data;
  const totalCards = stats?.totalCards ?? 0;
  const safeCurrentIndex = Math.min(
    currentIndex,
    Math.max(dueCards.length - 1, 0),
  );
  const currentReview = dueCards[safeCurrentIndex];
  const hasProgress = allReviews.length > 0;
  const isLoading =
    collectionQuery.isPending ||
    srs.dueCardsQuery.isPending ||
    srs.allReviewsQuery.isPending ||
    srs.statsQuery.isPending;

  const handleRate = async (rating: ReviewRating) => {
    if (!currentReview?.flashcard) {
      return;
    }

    await srs.submitReview.mutateAsync({
      flashcardId: currentReview.flashcard.id,
      rating,
    });
    setReviewedCount((value) => value + 1);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (!currentReview) {
      return;
    }

    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      setIsFlipped((value) => !value);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      setCurrentIndex((value) => Math.min(value + 1, dueCards.length - 1));
      setIsFlipped(false);
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setCurrentIndex((value) => Math.max(value - 1, 0));
      setIsFlipped(false);
    }

    if (!isFlipped || srs.submitReview.isPending) {
      return;
    }

    if (event.key === "1") {
      event.preventDefault();
      void handleRate(0);
    }
    if (event.key === "2") {
      event.preventDefault();
      void handleRate(1);
    }
    if (event.key === "3") {
      event.preventDefault();
      void handleRate(2);
    }
    if (event.key === "4") {
      event.preventDefault();
      void handleRate(3);
    }
  });

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (!id) {
    return null;
  }

  if (isLoading) {
    return <LoadingState className="min-h-screen bg-background" />;
  }

  if (!collection) {
    return (
      <EmptyState
        collectionId={id}
        title="Trace Missing"
        description="The requested collection could not be located in the current workspace. It may have been archived or deleted."
      />
    );
  }

  if (totalCards === 0) {
    return (
      <EmptyState
        collectionId={id}
        title="Zero Content"
        description="There is no data to schedule. Populate your collection with flashcards to enable the spaced repetition engine."
        actions={
          <Link to={`/learn/${id}`} className="inline-block">
            <Button size="lg" className="gap-2">
              Open Preview Session
            </Button>
          </Link>
        }
      />
    );
  }

  if (!hasProgress) {
    return (
      <EmptyState
        collectionId={id}
        title="Neural Map Ready"
        description="The scheduler is calibrated but has no historical data for this deck. Start your first session to begin the learning cycle."
        actions={
          <Button
            onClick={async () => {
              await srs.startSession.mutateAsync();
              setCurrentIndex(0);
              setReviewedCount(0);
              setIsFlipped(false);
            }}
            disabled={srs.startSession.isPending}
            size="lg"
            className="gap-2 group/start"
          >
            {srs.startSession.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 transition-transform group-hover/start:rotate-12" />
            )}
            Initiate Deep Learn
          </Button>
        }
      />
    );
  }

  if (dueCards.length === 0) {
    return (
      <EmptyState
        collectionId={id}
        title="Queue Depleted"
        description="Your neural pathways are optimized for now. All scheduled reviews are complete for this session."
        actions={
          <>
            <Button
              variant="outline"
              onClick={async () => {
                const confirmed = window.confirm(
                  "Permanently clear all SRS progress? This cannot be undone.",
                );
                if (!confirmed) return;
                await srs.clearProgress.mutateAsync();
                setCurrentIndex(0);
                setReviewedCount(0);
                setIsFlipped(false);
              }}
              disabled={srs.clearProgress.isPending}
              size="lg"
              className="gap-2"
            >
              {srs.clearProgress.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4" />
              )}
              Reset Schedule
            </Button>
            <Link to={`/learn/${id}`} className="inline-block">
              <Button size="lg" className="gap-2">
                Basic Review
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </>
        }
      />
    );
  }

  if (!currentReview) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-8 relative overflow-hidden">
      <div className="mx-auto max-w-7xl space-y-10 relative z-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="flex flex-wrap items-start justify-between gap-6"
        >
          <div className="space-y-4">
            <Link
              to={`/dashboard/collections/${id}`}
              className="group/back inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover/back:-translate-x-0.5" />
              Abandon Mission
            </Link>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
                Deep Learn Cycle
              </p>
              <h1 className="mt-2 font-display text-5xl font-black tracking-tight text-foreground sm:text-6xl">
                {collection.name}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="ghost"
              onClick={async () => {
                const confirmed = window.confirm(
                  "Reset your entire progress for this deck? This will start the algorithm from zero.",
                );
                if (!confirmed) return;
                await srs.clearProgress.mutateAsync();
                setCurrentIndex(0);
                setReviewedCount(0);
                setIsFlipped(false);
              }}
              disabled={srs.clearProgress.isPending}
              className="gap-2 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
            >
              <RotateCcw className="h-4 w-4" />
              Reset Alg
            </Button>
            <Link to={`/learn/${id}`}>
              <Button variant="outline" className="gap-2">
                Standard View
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.div>

        <div className="grid gap-10 xl:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="space-y-6">
            {/* Queue State */}
            <motion.section
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="rounded-xl border border-border bg-card/60 p-6 shadow-xl backdrop-blur-md group"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">
                Review Queue
              </p>
              <div className="mt-8 space-y-8 relative z-10">
                <div className="flex items-baseline gap-2">
                  <p className="font-display text-6xl font-black tracking-tighter text-foreground">
                    {String(safeCurrentIndex + 1).padStart(2, "0")}
                  </p>
                  <p className="text-sm font-bold text-muted-foreground">
                    / {String(dueCards.length).padStart(2, "0")} due
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="h-1.5 overflow-hidden rounded-none bg-muted border border-border/50">
                    <motion.div
                      className="h-full rounded-none bg-primary shadow-[0_0_12px_oklch(0.88_0.28_111_/_0.8)]"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${((safeCurrentIndex + 1) / dueCards.length) * 100}%`,
                      }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                      Visit Reviews
                    </p>
                    <span className="text-xs font-black text-foreground">
                      {reviewedCount}
                    </span>
                  </div>
                </div>
              </div>
            </motion.section>

            {stats && (
              <motion.section
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="rounded-xl border border-border bg-card/60 p-6 shadow-xl backdrop-blur-md"
              >
                <div className="flex items-center justify-between mb-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
                    Alg Metrics
                  </p>
                  <BarChart3 className="h-3.5 w-3.5 text-primary/60" />
                </div>
                <div className="grid gap-2">
                  <StatRow label="In Queue" value={stats.dueCards} />
                  <StatRow label="Learning" value={stats.learningCards} />
                  <StatRow
                    label="Knowledge Ease"
                    value={stats.averageEase.toFixed(2)}
                  />
                  <StatRow label="Total Samples" value={stats.totalReviews} />
                </div>
              </motion.section>
            )}

            <motion.section
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="rounded-xl border border-border bg-card/60 p-6 shadow-xl backdrop-blur-md"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground mb-5">
                Input Methods
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-12 items-center justify-center rounded border border-border bg-muted/40 text-[10px] font-bold text-foreground">
                    SPACE
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    Invert Card
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-8 items-center justify-center rounded border border-border bg-muted/40 text-[10px] font-bold text-foreground">
                    1-4
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    Rate Recall
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-8 items-center justify-center rounded border border-border bg-muted/40 text-[10px] font-bold text-foreground">
                    ←→
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    Skip Card
                  </span>
                </div>
              </div>
            </motion.section>
          </aside>

          <motion.section
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="space-y-10"
          >
            <div
              className="relative h-[500px] w-full [perspective:2000px] cursor-pointer"
              onClick={() => setIsFlipped((value) => !value)}
            >
              <div
                className="relative h-full w-full transition-transform duration-700 [transform-style:preserve-3d]"
                style={{
                  transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                }}
              >
                <div className="absolute inset-0 rounded-sm border border-border bg-card p-10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)] backdrop-blur-xl [backface-visibility:hidden] overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -mr-32 -mt-32 pointer-events-none" />
                  <div className="flex h-full flex-col justify-between">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
                          Input Prompt
                        </p>
                        <p className="text-[10px] uppercase font-black text-muted-foreground/50 tracking-widest">
                          {currentReview.status} trace
                        </p>
                      </div>
                      <div className="rounded-md border border-border bg-muted/30 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Next {formatInterval(currentReview.interval)}
                      </div>
                    </div>
                    <div className="flex-1 flex items-center justify-center text-center">
                      <motion.p
                        layout
                        className="font-display text-4xl font-black leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl max-w-4xl"
                      >
                        {currentReview.flashcard?.question}
                      </motion.p>
                    </div>
                    <div className="flex justify-center">
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/30">
                        <FlipHorizontal2 className="h-3 w-3" />
                        Flip to resolve
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute inset-0 rounded-sm border border-primary/40 bg-card p-10 shadow-[0_40px_100px_-20px_oklch(0.88_0.28_111_/_0.2)] backdrop-blur-xl [backface-visibility:hidden] [transform:rotateY(180deg)] overflow-hidden">
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 blur-[100px] -ml-32 -mb-32 pointer-events-none" />
                  <div className="flex h-full flex-col justify-between">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
                          Output Result
                        </p>
                        <p className="text-[10px] uppercase font-black text-muted-foreground/50 tracking-widest">
                          Stability {currentReview.easeFactor.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        <Dna className="h-3.5 w-3.5" />
                        Iteration {currentReview.reviewCount}
                      </div>
                    </div>
                    <div className="flex-1 flex items-center justify-center text-center">
                      <motion.p
                        layout
                        className="text-xl leading-relaxed text-foreground sm:text-2xl font-medium max-w-3xl"
                      >
                        {currentReview.flashcard?.answer}
                      </motion.p>
                    </div>
                    <div className="flex justify-center mb-2">
                      {currentReview.lapseCount > 0 && (
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-destructive/60 bg-destructive/5 px-2 py-1 rounded border border-destructive/20">
                          <ShieldAlert className="h-3 w-3" />
                          Detected {currentReview.lapseCount} lapses
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between px-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
                  Rate your recall
                </p>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsFlipped((v) => !v);
                    }}
                    className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary hover:text-primary/80 transition-colors"
                  >
                    {isFlipped ? "See Question" : "Reveal Answer"}
                  </button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {RATING_OPTIONS.map((option, index) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      void handleRate(option.value);
                    }}
                    disabled={!isFlipped || srs.submitReview.isPending}
                    className={`group relative rounded-xl border p-5 text-left transition-all disabled:opacity-30 disabled:grayscale disabled:scale-100 ${option.accent}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded bg-foreground/5 border border-foreground/10 text-[10px] font-black group-hover:bg-foreground/10">
                        {index + 1}
                      </div>
                      {srs.submitReview.isPending && currentIndex === 0 && (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      )}
                    </div>
                    <p className="text-sm font-black tracking-tight uppercase">
                      {option.label}
                    </p>
                    <p className="mt-1 text-[11px] font-medium opacity-70 leading-relaxed">
                      {option.hint}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <div className="flex items-center gap-4 rounded-sm border border-border bg-card/60 p-2 shadow-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex((value) => Math.max(value - 1, 0));
                    setIsFlipped(false);
                  }}
                  disabled={currentIndex === 0}
                  className="h-10 px-4"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="h-4 w-px bg-border" />
                <span className="text-[10px] font-bold tabular-nums text-muted-foreground px-4">
                  {safeCurrentIndex + 1} / {dueCards.length}
                </span>
                <div className="h-4 w-px bg-border" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex((value) =>
                      Math.min(value + 1, dueCards.length - 1),
                    );
                    setIsFlipped(false);
                  }}
                  disabled={currentIndex === dueCards.length - 1}
                  className="h-10 px-4"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/10 px-4 py-2.5 group hover:border-primary/20 transition-colors">
      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
      <span className="text-xs font-black text-foreground">{value}</span>
    </div>
  );
}
