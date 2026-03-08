import { Navigate, Outlet, Route, Routes, useLocation } from "react-router";
import { useAuth } from "@/features/auth/hooks/use-auth";

// ─── Pages ────────────────────────────────────────────────────────────────────
import { HomePage } from "@/routes/home-page";
import { SignInPage } from "@/features/auth/components/sign-in-page";
import { SignUpPage } from "@/features/auth/components/sign-up-page";
import { DashboardPage } from "@/routes/dashboard/dashboard-page";
import { DashboardLayout } from "@/routes/dashboard/dashboard-layout";
import { CollectionPage } from "@/routes/dashboard/collection-page";
import { LearnPage } from "@/routes/learn/learn-page";
import { SrsPage } from "@/routes/learn/srs-page";

// ─── Auth Guard ───────────────────────────────────────────────────────────────

function RequireAuth() {
  const location = useLocation();
  const { isAuthenticated, isPending } = useAuth();

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="space-y-3 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-muted border-t-foreground" />
          <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">
            Loading workspace
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

function PublicOnly() {
  const { isAuthenticated, isPending } = useAuth();

  if (isPending) {
    return null;
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
}

// ─── Root Layout ──────────────────────────────────────────────────────────────

function RootLayout() {
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <Outlet />
    </div>
  );
}

// ─── Route Tree ───────────────────────────────────────────────────────────────

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        {/* Public routes */}
        <Route index element={<HomePage />} />
        <Route element={<PublicOnly />}>
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
        </Route>

        {/* Protected routes */}
        <Route element={<RequireAuth />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route
              path="/dashboard/collections/:id"
              element={<CollectionPage />}
            />
          </Route>
          <Route path="/learn/:id" element={<LearnPage />} />
          <Route path="/learn/:id/srs" element={<SrsPage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
