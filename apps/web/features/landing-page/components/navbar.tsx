// features/landing-page/components/navbar.tsx
"use client";

import Link from "next/link";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          Recallly
        </Link>

        <div className="flex items-center gap-6">
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="default" size="sm">
                Sign in
              </Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <Button asChild variant="default" size="sm">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </SignedIn>
        </div>
      </nav>
    </header>
  );
}
