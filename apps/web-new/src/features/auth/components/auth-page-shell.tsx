import type { PropsWithChildren } from "react";
import { Link } from "react-router";
import { Zap, Shield } from "lucide-react";
import { motion } from "framer-motion";
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
      {/* Theme toggle — top right */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative grid w-full max-w-5xl gap-8 lg:grid-cols-[1.1fr_0.9fr]"
      >
        {/* Left panel — Brand / Marketing */}
        <div className="hidden rounded-xl border border-border bg-card/40 p-10 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.6)] backdrop-blur-xl lg:flex lg:flex-col lg:justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -mr-32 -mt-32 pointer-events-none" />

          <div className="space-y-10 relative z-10">
            <Link to="/" className="inline-flex items-center gap-3 group/logo">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-[11px] font-black text-primary-foreground shadow-[0_0_16px_oklch(0.52_0.26_258_/_0.5)] transition-transform group-hover/logo:scale-110">
                AQ
              </span>
              <span className="font-display text-lg font-bold tracking-tight text-foreground transition-colors group-hover/logo:text-primary">
                Advanced Quiz
              </span>
            </Link>

            <div className="space-y-6">
              <h2 className="font-display text-5xl font-black leading-[1.05] tracking-tight text-foreground">
                Master Your Knowledge.
              </h2>
              <p className="max-w-lg text-base leading-8 text-muted-foreground/80 font-medium font-sans">
                Build a study archive that actually works for you. Collections,
                rapid review, and spaced repetition built for deep focus.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 relative z-10 pt-8 border-t border-border/40">
            <div className="space-y-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-foreground">
                Fast Workflow
              </p>
              <p className="text-[13px] leading-5 text-muted-foreground font-medium">
                Optimised for speed and retention with adaptive SRS algorithms.
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-foreground">
                Modern Security
              </p>
              <p className="text-[13px] leading-5 text-muted-foreground font-medium">
                Enterprise-grade authentication powered by Better Auth.
              </p>
            </div>
          </div>
        </div>

        {/* Right panel — Auth Form */}
        <div className="relative w-full rounded-xl border border-border bg-card p-6 shadow-[0_32px_80px_-20px_rgba(0,0,0,0.5)] sm:p-10 flex flex-col justify-center">
          <div className="space-y-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary">
                Secure Access
              </div>
              <div className="space-y-2">
                <h1 className="font-display text-4xl font-black tracking-tight text-foreground sm:text-5xl">
                  {title}
                </h1>
                <p className="max-w-md text-sm leading-6 text-muted-foreground font-medium">
                  {description}
                </p>
              </div>
            </div>

            <div className="relative">{children}</div>

            <p className="text-[13px] text-muted-foreground font-medium border-t border-border/60 pt-6">
              {footerText}{" "}
              <Link
                to={footerActionTo}
                className="font-bold text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
              >
                {footerActionLabel}
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
