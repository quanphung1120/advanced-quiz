// features/landing-page/components/hero-section.tsx
"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

function FloatingCard({
  className,
  front,
  back,
  delay = "0s",
}: {
  className?: string;
  front: string;
  back: string;
  delay?: string;
}) {
  return (
    <div
      className={`group perspective-1000 ${className}`}
      style={{ animationDelay: delay }}
    >
      <div className="relative h-32 w-48 transform-style-preserve-3d transition-transform duration-700 group-hover:rotate-y-180">
        {/* Front */}
        <div className="absolute inset-0 backface-hidden rounded-xl border border-border bg-card p-4 shadow-lg">
          <div className="flex h-full flex-col justify-between">
            <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Question
            </span>
            <p className="text-sm font-medium text-foreground">{front}</p>
            <div className="h-1 w-8 rounded-full bg-primary/30" />
          </div>
        </div>
        {/* Back */}
        <div className="absolute inset-0 rotate-y-180 backface-hidden rounded-xl border border-primary/20 bg-primary/5 p-4 shadow-lg">
          <div className="flex h-full flex-col justify-between">
            <span className="text-[10px] font-medium uppercase tracking-widest text-primary">
              Answer
            </span>
            <p className="text-sm font-medium text-foreground">{back}</p>
            <div className="h-1 w-8 rounded-full bg-primary" />
          </div>
        </div>
      </div>
    </div>
  );
}

function InteractiveFlashcardDemo() {
  return (
    <div className="relative">
      {/* Main Demo Card */}
      <div className="relative z-10 mx-auto w-full max-w-sm">
        {/* Demo App Window */}
        <div
          className="animate-scale-in overflow-hidden rounded-2xl border border-border/50 bg-card/80 shadow-2xl backdrop-blur-sm opacity-0"
          style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}
        >
          {/* Window Header */}
          <div className="flex items-center gap-2 border-b border-border/50 bg-muted/30 px-4 py-3">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-400/80" />
              <div className="h-3 w-3 rounded-full bg-yellow-400/80" />
              <div className="h-3 w-3 rounded-full bg-green-400/80" />
            </div>
            <div className="flex-1 text-center">
              <span className="text-xs text-muted-foreground">
                Recallly - Study Mode
              </span>
            </div>
          </div>

          {/* Flashcard Content */}
          <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                Biology
              </span>
              <span className="text-xs text-muted-foreground">
                Card 3 of 12
              </span>
            </div>

            {/* Flashcard */}
            <div className="group perspective-1000 cursor-pointer">
              <div className="relative h-44 w-full transform-style-preserve-3d transition-transform duration-700 transform-3d hover:transform-[rotateY(180deg)]">
                {/* Front Side */}
                <div className="absolute inset-0 flex items-center justify-center rounded-xl border-2 border-primary/20 bg-linear-to-br from-primary/5 to-primary/10 p-6 backface-hidden">
                  <div className="text-center">
                    <span className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-primary">
                      Question
                    </span>
                    <p className="font-display text-lg text-foreground">
                      What is the powerhouse of the cell?
                    </p>
                  </div>
                </div>
                {/* Back Side */}
                <div className="absolute inset-0 flex items-center justify-center rounded-xl border-2 border-primary bg-primary/10 p-6 backface-hidden transform-[rotateY(180deg)]">
                  <div className="text-center">
                    <span className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-primary">
                      Answer
                    </span>
                    <p className="font-display text-xl font-medium text-primary">
                      Mitochondria
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="mt-6 flex items-center justify-center gap-3">
              <button className="rounded-full bg-destructive/10 p-3 text-destructive transition-colors hover:bg-destructive/20">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <button className="rounded-full bg-muted p-3 text-muted-foreground transition-colors hover:bg-muted/80">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
              <button className="rounded-full bg-green-500/10 p-3 text-green-600 transition-colors hover:bg-green-500/20">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Cards Around Demo */}
      <FloatingCard
        className="animate-float pointer-events-auto absolute -left-16 -top-8 hidden lg:block"
        front="H₂O is the formula for?"
        back="Water"
        delay="0.5s"
      />
      <FloatingCard
        className="animate-float pointer-events-auto absolute -bottom-12 -right-20 hidden lg:block"
        front="光 (guāng) means?"
        back="Light"
        delay="1s"
      />
    </div>
  );
}

export function HeroSection() {
  return (
    <main className="relative flex flex-1 flex-col overflow-hidden">
      {/* Background Pattern */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-4 top-20 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -right-4 top-40 h-96 w-96 rounded-full bg-primary/3 blur-3xl" />
        <div className="absolute bottom-20 left-1/3 h-64 w-64 rounded-full bg-accent/30 blur-3xl" />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />
        {/* Decorative Elements */}
        <div className="absolute right-[10%] top-[15%] hidden text-primary/10 lg:block">
          <svg
            className="h-24 w-24 animate-bounce-subtle"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <div className="absolute bottom-[20%] left-[5%] hidden text-primary/10 lg:block">
          <svg
            className="h-16 w-16 animate-bounce-subtle"
            style={{ animationDelay: "0.5s" }}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
          </svg>
        </div>
      </div>

      {/* Hero Content - Two Column Layout */}
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 items-center px-4 py-16 sm:py-24 lg:py-32">
        <div className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left Column - Text Content */}
          <div className="text-center lg:text-left">
            {/* Main Heading */}
            <div
              className="animate-fade-in-up mb-6 opacity-0"
              style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}
            >
              <h1 className="font-display text-4xl font-normal tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                <span className="block">Master anything</span>
                <span className="mt-2 block bg-linear-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
                  with flashcards
                </span>
              </h1>
            </div>

            {/* Subheading */}
            <div
              className="animate-fade-in-up mb-8 opacity-0"
              style={{ animationDelay: "0.3s", animationFillMode: "forwards" }}
            >
              <p className="mx-auto max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg md:text-xl lg:mx-0">
                Create collections, add flashcards, and study them with ease.
                Recallly helps you organize your learning materials and review
                them{" "}
                <span className="font-medium text-foreground">
                  whenever you want
                </span>
                .
              </p>
            </div>

            {/* CTA Buttons */}
            <div
              className="animate-fade-in-up mb-8 flex flex-col items-center gap-4 opacity-0 sm:flex-row lg:justify-start"
              style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}
            >
              <SignedOut>
                <SignInButton mode="modal">
                  <Button
                    size="lg"
                    className="group min-w-[180px] gap-2 text-base"
                  >
                    Get started free
                    <svg
                      className="h-4 w-4 transition-transform group-hover:translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </Button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Button
                  size="lg"
                  asChild
                  className="group min-w-[180px] gap-2 text-base"
                >
                  <Link href="/dashboard" prefetch={false}>
                    Go to Dashboard
                    <svg
                      className="h-4 w-4 transition-transform group-hover:translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </Link>
                </Button>
              </SignedIn>
              <Button
                variant="outline"
                size="lg"
                className="min-w-[180px] text-base"
              >
                See how it works
              </Button>
            </div>

            {/* Stats */}
            <div
              className="animate-fade-in-up flex flex-wrap items-center justify-center gap-3 opacity-0 lg:justify-start"
              style={{ animationDelay: "0.5s", animationFillMode: "forwards" }}
            >
              <span className="rounded-full border border-border bg-background/80 px-4 py-2 text-xs font-medium text-muted-foreground">
                ✓ Create collections
              </span>
              <span className="rounded-full border border-border bg-background/80 px-4 py-2 text-xs font-medium text-muted-foreground">
                ✓ Add flashcards
              </span>
              <span className="rounded-full border border-border bg-background/80 px-4 py-2 text-xs font-medium text-muted-foreground">
                ✓ Study & review
              </span>
              <span className="rounded-full border border-primary/30 bg-primary/5 px-4 py-2 text-xs font-medium text-primary">
                100% Free
              </span>
            </div>
          </div>

          {/* Right Column - Interactive Demo */}
          <div className="relative hidden lg:block">
            <InteractiveFlashcardDemo />
          </div>
        </div>
      </div>

      {/* Mobile: Floating Cards */}
      <div className="pointer-events-none relative z-10 mb-8 flex justify-center gap-4 lg:hidden">
        <FloatingCard
          className="animate-float pointer-events-auto"
          front="What is spaced repetition?"
          back="A learning technique using intervals"
          delay="0s"
        />
      </div>
    </main>
  );
}
