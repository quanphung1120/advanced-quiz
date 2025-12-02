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
      </div>

      {/* Hero Content */}
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-4 py-16 sm:py-24 lg:py-32">
        {/* Badge */}
        <div
          className="animate-fade-in mb-8 opacity-0"
          style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-4 py-2 text-xs font-medium tracking-wide text-muted-foreground backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Powered by spaced repetition science
          </span>
        </div>

        {/* Main Heading */}
        <div
          className="animate-fade-in-up mb-6 text-center opacity-0"
          style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}
        >
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="block">Master anything</span>
            <span className="mt-2 block bg-linear-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
              with flashcards
            </span>
          </h1>
        </div>

        {/* Subheading */}
        <div
          className="animate-fade-in-up mb-10 max-w-2xl text-center opacity-0"
          style={{ animationDelay: "0.3s", animationFillMode: "forwards" }}
        >
          <p className="text-base leading-relaxed text-muted-foreground sm:text-lg md:text-xl">
            Create collections, add flashcards, and study them with ease.
            Recallly helps you organize your learning materials and review them{" "}
            <span className="font-medium text-foreground">
              whenever you want
            </span>
            .
          </p>
        </div>

        {/* CTA Buttons */}
        <div
          className="animate-fade-in-up mb-16 flex flex-col items-center gap-4 opacity-0 sm:flex-row"
          style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}
        >
          <SignedOut>
            <SignInButton mode="modal">
              <Button size="lg" className="group min-w-[180px] gap-2 text-base">
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
          className="animate-fade-in-up flex flex-wrap items-center justify-center gap-3 opacity-0"
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
          <span className="rounded-full border border-border bg-background/80 px-4 py-2 text-xs font-medium text-muted-foreground">
            100% Free
          </span>
        </div>
      </div>

      {/* Floating Cards - Desktop Only */}
      <div className="pointer-events-none absolute inset-0 hidden lg:block">
        <FloatingCard
          className="animate-float pointer-events-auto absolute left-[8%] top-[25%]"
          front="What is spaced repetition?"
          back="A learning technique using increasing intervals"
          delay="0s"
        />
        <FloatingCard
          className="animate-float pointer-events-auto absolute right-[10%] top-[20%]"
          front="H₂O is the formula for?"
          back="Water"
          delay="0.5s"
        />
        <FloatingCard
          className="animate-float pointer-events-auto absolute bottom-[25%] left-[5%]"
          front="光 (guāng) means?"
          back="Light"
          delay="1s"
        />
        <FloatingCard
          className="animate-float pointer-events-auto absolute bottom-[30%] right-[8%]"
          front="Mitochondria is the..."
          back="Powerhouse of the cell"
          delay="1.5s"
        />
      </div>
    </main>
  );
}
