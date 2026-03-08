import { useEffect, useEffectEvent, useState } from "react";
import { Link, useParams } from "react-router";
import {
  ArrowLeft,
  ArrowRight,
  FlipHorizontal2,
  Orbit,
  Sparkles,
} from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { useCollection } from "@/features/collections/hooks/use-collections";
import { useFlashcards } from "@/features/flashcards/hooks/use-flashcards";
import { Button } from "@/components/ui/button";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export function LearnPage() {
  const { id } = useParams();

  const collectionQuery = useCollection(id ?? "");
  const flashcardsQuery = useFlashcards(id ?? "");

  const collection = collectionQuery.data?.collection;
  const flashcards = flashcardsQuery.data?.flashcards ?? [];

  if (!id) {
    return null;
  }

  if (collectionQuery.isPending || flashcardsQuery.isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="space-y-4 text-center">
          <div className="mx-auto h-12 w-12 animate-pulse rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-transparent border-t-primary" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
            Synchronizing deck trace
          </p>
        </div>
      </div>
    );
  }

  if (!collection || flashcards.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="max-w-lg rounded-xl border border-border bg-card p-10 text-center shadow-[0_40px_120px_-20px_rgba(0,0,0,0.6)] backdrop-blur-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] -mr-16 -mt-16 pointer-events-none" />

          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
            Access Restricted
          </p>
          <h1 className="mt-5 font-display text-4xl font-black tracking-tight text-foreground">
            No knowledge points found
          </h1>
          <p className="mt-4 text-sm leading-7 text-muted-foreground font-medium">
            This collection is currently empty. Add flashcards from the
            workspace to begin your study session.
          </p>
          <Link
            to={`/dashboard/collections/${id}`}
            className="mt-8 inline-block"
          >
            <Button size="lg" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Return to Deck Settings
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <LearnSession
      key={id}
      collectionId={id}
      collectionName={collection.name}
      flashcards={flashcards}
    />
  );
}

type LearnSessionProps = {
  collectionId: string;
  collectionName: string;
  flashcards: Array<{ id: string; question: string; answer: string }>;
};

function LearnSession({
  collectionId,
  collectionName,
  flashcards,
}: LearnSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const currentCard = flashcards[currentIndex];

  const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (!currentCard) {
      return;
    }

    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      setIsFlipped((value) => !value);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      setCurrentIndex((value) => Math.min(value + 1, flashcards.length - 1));
      setIsFlipped(false);
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setCurrentIndex((value) => Math.max(value - 1, 0));
      setIsFlipped(false);
    }
  });

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-8 relative overflow-hidden">
      <div className="mx-auto max-w-6xl space-y-10 relative z-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="flex flex-wrap items-start justify-between gap-6"
        >
          <div className="space-y-4">
            <Link
              to={`/dashboard/collections/${collectionId}`}
              className="group/back inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover/back:-translate-x-0.5" />
              Abandon Session
            </Link>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
                Session Active
              </p>
              <h1 className="mt-2 font-display text-5xl font-black tracking-tight text-foreground sm:text-6xl">
                {collectionName}
              </h1>
            </div>
          </div>

          <Link to={`/learn/${collectionId}/srs`} className="inline-block">
            <Button variant="outline" size="lg" className="gap-2 group/srs">
              <Orbit className="h-4 w-4 transition-transform group-hover/srs:rotate-45" />
              Switch to SRS Deep Focus
            </Button>
          </Link>
        </motion.div>

        <div className="grid gap-8 xl:grid-cols-[300px_minmax(0,1fr)]">
          {/* Progress Tracker */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="rounded-xl border border-border bg-card/60 p-6 shadow-xl backdrop-blur-md h-fit relative group"
          >
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary relative z-10">
              Session Progress
            </p>
            <div className="mt-8 space-y-8 relative z-10">
              <div className="flex items-baseline gap-2">
                <p className="font-display text-6xl font-black tracking-tighter text-foreground">
                  {String(currentIndex + 1).padStart(2, "0")}
                </p>
                <p className="text-sm font-bold text-muted-foreground">
                  / {String(flashcards.length).padStart(2, "0")} cards
                </p>
              </div>
              <div className="space-y-4">
                <div className="h-1.5 overflow-hidden rounded-full bg-muted border border-border/50 shadow-inner">
                  <motion.div
                    className="h-full rounded-full bg-primary shadow-[0_0_12px_oklch(0.52_0.26_258_/_0.8)]"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${((currentIndex + 1) / flashcards.length) * 100}%`,
                    }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                </div>
                <div className="space-y-3 rounded-lg bg-background/40 p-3.5 border border-border/40">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    <Sparkles className="h-3 w-3 text-primary" />
                    Hotkeys
                  </div>
                  <p className="text-xs leading-5 text-muted-foreground font-medium">
                    <span className="text-foreground bg-muted px-1.5 py-0.5 rounded border border-border/60">
                      Space
                    </span>{" "}
                    to flip.{" "}
                    <span className="text-foreground bg-muted px-1.5 py-0.5 rounded border border-border/60">
                      ←
                    </span>{" "}
                    <span className="text-foreground bg-muted px-1.5 py-0.5 rounded border border-border/60">
                      →
                    </span>{" "}
                    to navigate.
                  </p>
                </div>
              </div>
            </div>
          </motion.aside>

          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="space-y-8"
          >
            <div
              className="relative h-[480px] w-full [perspective:2000px] cursor-pointer"
              onClick={() => setIsFlipped((value) => !value)}
            >
              <div
                className="relative h-full w-full transition-transform duration-700 [transform-style:preserve-3d]"
                style={{
                  transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                }}
              >
                {/* Front face */}
                <div className="absolute inset-0 rounded-xl border border-border bg-card p-10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)] backdrop-blur-xl [backface-visibility:hidden] overflow-hidden flex flex-col items-center justify-center text-center">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -mr-32 -mt-32 pointer-events-none" />
                  <p className="absolute top-10 left-10 text-[10px] font-bold uppercase tracking-[0.3em] text-primary/60">
                    Input Point
                  </p>
                  <motion.p
                    layout
                    key={currentCard?.id + "-q"}
                    className="font-display text-4xl font-black leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl max-w-4xl"
                  >
                    {currentCard?.question}
                  </motion.p>
                  <div className="absolute bottom-10 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">
                    <FlipHorizontal2 className="h-3 w-3" />
                    Click or Space to reveal
                  </div>
                </div>

                {/* Back face */}
                <div className="absolute inset-0 rounded-xl border border-primary/40 bg-card p-10 shadow-[0_40px_100px_-20px_oklch(0.52_0.26_258_/_0.2)] backdrop-blur-xl [backface-visibility:hidden] [transform:rotateY(180deg)] overflow-hidden flex flex-col items-center justify-center text-center">
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 blur-[100px] -ml-32 -mb-32 pointer-events-none" />
                  <p className="absolute top-10 left-10 text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
                    Output Resolution
                  </p>
                  <motion.p
                    layout
                    key={currentCard?.id + "-a"}
                    className="text-xl leading-relaxed text-foreground sm:text-2xl font-medium max-w-3xl"
                  >
                    {currentCard?.answer}
                  </motion.p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-6 rounded-xl border border-border bg-card/60 p-4 shadow-xl backdrop-blur-md">
              <Button
                variant="ghost"
                size="lg"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex((value) => Math.max(value - 1, 0));
                  setIsFlipped(false);
                }}
                disabled={currentIndex === 0}
                className="gap-2 h-14"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous Card
              </Button>

              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFlipped((value) => !value);
                }}
                size="lg"
                className="gap-2 h-14 px-10 shadow-[0_8px_32px_oklch(0.52_0.26_258_/_0.4)]"
              >
                <FlipHorizontal2 className="h-4 w-4" />
                Invert Perspective
              </Button>

              <Button
                variant="ghost"
                size="lg"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex((value) =>
                    Math.min(value + 1, flashcards.length - 1),
                  );
                  setIsFlipped(false);
                }}
                disabled={currentIndex === flashcards.length - 1}
                className="gap-2 h-14"
              >
                Next Deck Point
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
