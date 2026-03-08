import type { PropsWithChildren } from "react";
import { Link } from "react-router";
import { ThemeToggle } from "@/components/ui/theme-toggle";

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
      <div className="hidden lg:flex lg:flex-col lg:justify-between bg-white text-gray-900 px-14 py-12">
        <div className="space-y-5">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-gray-400">
            Study system
          </p>
          <h2 className="font-display text-6xl font-black leading-[1.04] tracking-tight text-gray-900">
            Master Your
            <br />
            Knowledge.
          </h2>
          <p className="text-base leading-7 text-gray-500 max-w-xs font-medium">
            Collections, rapid review, and spaced repetition built for deep
            focus.
          </p>
        </div>

        <p className="text-xs text-gray-300 font-medium">
          &copy; {new Date().getFullYear()} Advanced Quiz
        </p>
      </div>

      {/* ── Right panel: Dark side ─────────────────────────────────── */}
      <div className="relative flex min-h-screen flex-col items-center justify-center bg-black px-6 py-16 sm:px-12">
        {/* Top bar */}
        <div className="absolute top-5 right-5 flex items-center gap-4">
          <ThemeToggle />
        </div>

        {/* Mobile: show left panel text */}
        <div className="lg:hidden mb-10 self-start">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-gray-400">
            Study system
          </p>
          <h2 className="font-display text-4xl font-black leading-[1.04] tracking-tight text-white mt-2">
            Master Your
            <br />
            Knowledge.
          </h2>
        </div>

        <div className="w-full max-w-sm">
          {/* Heading */}
          <div className="mb-8 space-y-2">
            <h1 className="font-display text-4xl font-black tracking-tight text-white">
              {title}
            </h1>
            <p className="text-sm leading-6 text-gray-400 font-medium">
              {description}
            </p>
          </div>

          {/* Form slot */}
          {children}

          {/* Footer */}
          <p className="mt-8 text-sm text-gray-500 font-medium border-t border-gray-800 pt-6">
            {footerText}{" "}
            <Link
              to={footerActionTo}
              className="font-bold text-white hover:text-[#D9FF00] transition-colors"
            >
              {footerActionLabel}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
