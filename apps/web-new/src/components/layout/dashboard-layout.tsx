import { useState, type PropsWithChildren } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import {
  BookMarked,
  BrainCircuit,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { signOut, useSession } from "@/features/auth/api/auth-client";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const SIDEBAR_WIDTH = 256;

const sidebarVariants: Variants = {
  hidden: { x: "-100%", opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      damping: 30,
      stiffness: 300,
      mass: 0.8,
    },
  },
  exit: {
    x: "-100%",
    opacity: 0,
    transition: {
      type: "spring",
      damping: 35,
      stiffness: 320,
      mass: 0.8,
    },
  },
};

const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.18 } },
  exit: { opacity: 0, transition: { duration: 0.18 } },
};

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();

  const userName = session?.user?.name ?? "Learner";
  const userEmail = session?.user?.email ?? "";
  const initials = userName
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  const handleSignOut = async () => {
    await signOut();
    navigate("/sign-in");
  };

  return (
    <div className="flex h-full flex-col gap-5 px-4 py-5">
      {/* Brand */}
      <div className="flex items-center justify-between px-1 py-1">
        <Link
          to="/dashboard"
          onClick={onClose}
          className="inline-flex items-center gap-2.5"
        >
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Study System
            </p>
            <p className="font-display text-sm font-bold leading-none tracking-tight text-foreground">
              Advanced Quiz
            </p>
          </div>
        </Link>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border p-1.5 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Nav */}
      <nav className="flex-1 space-y-0.5">
        <p className="mb-2 px-2 text-[9px] font-semibold uppercase tracking-[0.3em] text-muted-foreground/60">
          Navigation
        </p>
        <NavLink
          to="/dashboard"
          end
          onClick={onClose}
          className={({ isActive }) =>
            [
              "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
              isActive
                ? "bg-primary/15 text-primary shadow-[inset_0_0_0_1px_oklch(0.88_0.28_111_/_0.2)]"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            ].join(" ")
          }
        >
          <LayoutDashboard className="h-4 w-4 shrink-0" />
          Dashboard
        </NavLink>
        <NavLink
          to="/dashboard"
          onClick={onClose}
          className={({ isActive }) =>
            [
              "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
              isActive
                ? "text-muted-foreground hover:bg-accent hover:text-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            ].join(" ")
          }
        >
          <BrainCircuit className="h-4 w-4 shrink-0" />
          Collections
        </NavLink>
      </nav>

      {/* Study tip card */}
      <div className="rounded-sm border border-primary/20 bg-primary/8 p-4">
        <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-primary/70">
          Quick tip
        </p>
        <p className="mt-2 text-xs font-semibold text-foreground">
          Study in short bursts
        </p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          15-minute sessions beat hour-long cramming. The SRS queue keeps your
          schedule optimised automatically.
        </p>
      </div>

      {/* Theme switcher */}
      <div className="flex flex-col gap-2">
        <p className="px-1 text-[9px] font-semibold uppercase tracking-[0.3em] text-muted-foreground/60">
          Appearance
        </p>
        <ThemeToggle className="w-full justify-between" />
      </div>

      {/* User profile + sign out */}
      <div className="rounded-sm border border-border bg-muted/30 p-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-primary/20 text-xs font-bold text-primary">
            {isPending ? (
              <BookMarked className="h-3.5 w-3.5" />
            ) : (
              initials || <BookMarked className="h-3.5 w-3.5" />
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-foreground">
              {isPending ? "Loading…" : userName}
            </p>
            <p className="truncate text-[10px] text-muted-foreground">
              {userEmail || "Signed in"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-all hover:border-destructive/40 hover:text-destructive"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </button>
      </div>
    </div>
  );
}

export function DashboardLayout({ children }: PropsWithChildren) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      {/* ── Desktop sidebar ── */}
      <aside
        className="fixed inset-y-0 left-0 z-30 hidden border-r border-border bg-card/80 backdrop-blur-xl lg:flex"
        style={{ width: SIDEBAR_WIDTH }}
      >
        <div className="w-full overflow-y-auto">
          <SidebarContent />
        </div>
      </aside>

      {/* ── Mobile sidebar + backdrop ── */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            <motion.div
              key="backdrop"
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md lg:hidden"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <motion.aside
              key="sidebar"
              variants={sidebarVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-y-0 left-0 z-50 flex border-r border-border bg-card lg:hidden"
              style={{ width: SIDEBAR_WIDTH }}
            >
              <div className="w-full overflow-y-auto">
                <SidebarContent onClose={() => setIsMobileSidebarOpen(false)} />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main area ── */}
      <div
        className="relative flex min-h-screen flex-col"
        style={{ paddingLeft: `${SIDEBAR_WIDTH}px` }}
      >
        {/* Override padding on mobile */}
        <div className="lg:hidden" style={{ paddingLeft: 0 }} />

        {/* Mobile topbar */}
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/80 px-4 py-3.5 backdrop-blur-xl lg:hidden">
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(true)}
            className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            <Menu className="h-4 w-4" />
          </button>
          <Link to="/dashboard" className="inline-flex items-center gap-2">
            <span className="font-display text-sm font-bold leading-none tracking-tight text-foreground">
              Advanced Quiz
            </span>
          </Link>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
