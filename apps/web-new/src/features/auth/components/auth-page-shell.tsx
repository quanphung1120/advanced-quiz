import type { PropsWithChildren } from "react";
import { Link } from "react-router";
import { ModeToggle } from "@/components/mode-toggle";

type AuthPageShellProps = PropsWithChildren<{
  title: string;
  description: string;
  footerText: string;
  footerActionLabel: string;
  footerActionTo: "/sign-in" | "/sign-up";
}>;

export function AuthPageShell({
  title,
  description,
  footerText,
  footerActionLabel,
  footerActionTo,
  children,
}: AuthPageShellProps) {
  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-2">
      {/* ── Left panel: Light side ────────────────────────────────── */}
      <div className="hidden lg:flex lg:flex-col lg:justify-between bg-muted text-foreground px-14 py-12 border-r border-border">
        <div className="space-y-5">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground">
            Study system
          </p>
          <h2 className="font-display text-6xl font-black leading-[1.04] tracking-tight text-foreground">
            Master Your
            <br />
            Knowledge.
          </h2>
          <p className="text-base leading-7 text-muted-foreground max-w-xs font-medium">
            Collections, rapid review, and spaced repetition built for deep
            focus.
          </p>
        </div>

        <p className="text-xs text-muted-foreground font-medium">
          &copy; {new Date().getFullYear()} Advanced Quiz
        </p>
      </div>

      {/* ── Right panel: Dark side ─────────────────────────────────── */}
      <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-6 py-16 sm:px-12">
        {/* Top bar */}
        <div className="absolute top-5 right-5 flex items-center gap-4">
          <ModeToggle />
        </div>

        {/* Mobile: show left panel text */}
        <div className="lg:hidden mb-10 self-start">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground">
            Study system
          </p>
          <h2 className="font-display text-4xl font-black leading-[1.04] tracking-tight text-foreground mt-2">
            Master Your
            <br />
            Knowledge.
          </h2>
        </div>

        <div className="w-full max-w-sm">
          {/* Heading */}
          <div className="mb-8 space-y-2">
            <h1 className="font-display text-4xl font-black tracking-tight text-foreground">
              {title}
            </h1>
            <p className="text-sm leading-6 text-muted-foreground font-medium">
              {description}
            </p>
          </div>

          {/* Form slot */}
          {children}

          {/* Footer */}
          <p className="mt-8 text-sm text-muted-foreground font-medium border-t border-border pt-6">
            {footerText}{" "}
            <Link
              to={footerActionTo}
              className="font-bold text-foreground hover:text-primary transition-colors"
            >
              {footerActionLabel}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
