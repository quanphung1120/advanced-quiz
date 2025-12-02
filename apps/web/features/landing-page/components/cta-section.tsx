// features/landing-page/components/cta-section.tsx
"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

export function CTASection() {
  return (
    <section className="border-t border-border/40 bg-muted/30 py-20 sm:py-28">
      <div className="container mx-auto max-w-4xl px-4 text-center">
        {/* Decorative Elements */}
        <div className="relative">
          <div className="absolute -left-4 -top-4 h-24 w-24 rounded-full bg-primary/5 blur-2xl" />
          <div className="absolute -bottom-4 -right-4 h-32 w-32 rounded-full bg-primary/5 blur-2xl" />

          <div className="relative">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Start organizing
              <br />
              your learning today
            </h2>
            <p className="mx-auto mb-10 max-w-xl text-lg text-muted-foreground">
              Create your first collection and add flashcards in minutes.
              Recallly is free to use — no credit card required.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <SignedOut>
                <SignInButton mode="modal">
                  <Button
                    size="lg"
                    className="group min-w-[200px] gap-2 text-base"
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
                  className="group min-w-[200px] gap-2 text-base"
                >
                  <Link href="/dashboard">
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
            </div>

            <p className="mt-6 text-sm text-muted-foreground">
              Free forever • No credit card required
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
