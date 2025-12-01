// features/landing-page/components/hero-section.tsx
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center sm:py-32">
      <div className="mx-auto max-w-2xl space-y-8">
        <span className="inline-block rounded-full border border-border bg-muted px-4 py-1.5 text-xs font-medium text-muted-foreground">
          Flashcard app for serious learners
        </span>

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Remember everything
          <br />
          you learn
        </h1>

        <p className="mx-auto max-w-lg text-lg leading-relaxed text-muted-foreground">
          Recallly uses spaced repetition to help you retain knowledge
          effortlessly. Study smarter, not harder, and build lasting memory.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg" className="min-w-[160px]">
            Start reviewing
          </Button>
          <Button variant="ghost" size="lg" className="min-w-[160px]">
            View demo
          </Button>
        </div>
      </div>
    </main>
  );
}
