import { type ReactNode, Suspense, lazy } from "react";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router";
import { LoadingState } from "@/components/loading-state";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { RootLayout } from "@/layouts/root-layout";
import { DashboardPageLayout } from "@/pages/dashboard/dashboard-layout-page";

const HomePage = lazy(() =>
  import("@/pages/home-page").then((module) => ({ default: module.HomePage })),
);
const SignInPage = lazy(() =>
  import("@/pages/auth/sign-in-page").then((module) => ({
    default: module.SignInPage,
  })),
);
const SignUpPage = lazy(() =>
  import("@/pages/auth/sign-up-page").then((module) => ({
    default: module.SignUpPage,
  })),
);
const VerifyEmailPage = lazy(() =>
  import("@/pages/auth/verify-email-page").then((module) => ({
    default: module.VerifyEmailPage,
  })),
);
const ForgotPasswordPage = lazy(() =>
  import("@/pages/auth/forgot-password-page").then((module) => ({
    default: module.ForgotPasswordPage,
  })),
);
const ResetPasswordPage = lazy(() =>
  import("@/pages/auth/reset-password-page").then((module) => ({
    default: module.ResetPasswordPage,
  })),
);
const DashboardPage = lazy(() =>
  import("@/pages/dashboard/dashboard-page").then((module) => ({
    default: module.DashboardPage,
  })),
);
const ChatSessionsPage = lazy(() =>
  import("@/pages/dashboard/chat-sessions-page").then((module) => ({
    default: module.ChatSessionsPage,
  })),
);
const ChatPage = lazy(() =>
  import("@/pages/dashboard/chat-page").then((module) => ({
    default: module.ChatPage,
  })),
);
const CollectionPage = lazy(() =>
  import("@/pages/dashboard/collection-page").then((module) => ({
    default: module.CollectionPage,
  })),
);
const LearnPage = lazy(() =>
  import("@/pages/learn/learn-page").then((module) => ({
    default: module.LearnPage,
  })),
);
const SrsPage = lazy(() =>
  import("@/pages/learn/srs-page").then((module) => ({
    default: module.SrsPage,
  })),
);

function RouteFallback() {
  return (
    <LoadingState
      label="Loading route"
      className="min-h-screen bg-background px-6"
    />
  );
}

function ProtectedRouteFallback() {
  return <LoadingState />;
}

function SessionErrorState() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-md space-y-4 border border-border bg-card p-8 text-center shadow-sm">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
            Session unavailable
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Unable to verify your session
          </h1>
          <p className="text-sm leading-6 text-muted-foreground">
            The API did not respond as expected. Refresh and try again.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            window.location.reload();
          }}
          className="inline-flex h-10 items-center justify-center border border-border px-4 text-sm font-medium transition-colors hover:bg-accent"
        >
          Reload
        </button>
      </div>
    </div>
  );
}

function withRouteSuspense(node: ReactNode, fallback = <RouteFallback />) {
  return <Suspense fallback={fallback}>{node}</Suspense>;
}

function HomeRoute() {
  const { isPending } = useAuth();

  if (isPending) {
    return <RouteFallback />;
  }

  return withRouteSuspense(<HomePage />);
}

function RequireAuth() {
  const location = useLocation();
  const { error, isAuthenticated, isPending } = useAuth();

  if (isPending) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardPageLayout isLoading={true} />
      </div>
    );
  }

  if (error) {
    return <SessionErrorState />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

function PublicOnly() {
  const { error, isAuthenticated, isPending } = useAuth();

  if (isPending) {
    return null;
  }

  if (error) {
    return <SessionErrorState />;
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<HomeRoute />} />
        <Route element={<PublicOnly />}>
          <Route
            path="/sign-in"
            element={withRouteSuspense(<SignInPage />)}
          />
          <Route
            path="/sign-up"
            element={withRouteSuspense(<SignUpPage />)}
          />
          <Route
            path="/verify-email"
            element={withRouteSuspense(<VerifyEmailPage />)}
          />
          <Route
            path="/forgot-password"
            element={withRouteSuspense(<ForgotPasswordPage />)}
          />
          <Route
            path="/reset-password"
            element={withRouteSuspense(<ResetPasswordPage />)}
          />
        </Route>

        <Route element={<RequireAuth />}>
          <Route element={<DashboardPageLayout />}>
            <Route
              path="/dashboard"
              element={withRouteSuspense(
                <DashboardPage />,
                <ProtectedRouteFallback />,
              )}
            />
            <Route
              path="/dashboard/chat"
              element={withRouteSuspense(
                <ChatSessionsPage />,
                <ProtectedRouteFallback />,
              )}
            />
            <Route
              path="/dashboard/chat/new"
              element={withRouteSuspense(
                <ChatPage />,
                <ProtectedRouteFallback />,
              )}
            />
            <Route
              path="/dashboard/chat/sessions"
              element={<Navigate to="/dashboard/chat" replace />}
            />
            <Route
              path="/dashboard/chat/:id"
              element={withRouteSuspense(
                <ChatPage />,
                <ProtectedRouteFallback />,
              )}
            />
            <Route
              path="/dashboard/collections/:id"
              element={withRouteSuspense(
                <CollectionPage />,
                <ProtectedRouteFallback />,
              )}
            />
          </Route>
          <Route
            path="/learn/:id"
            element={withRouteSuspense(<LearnPage />)}
          />
          <Route
            path="/learn/:id/srs"
            element={withRouteSuspense(<SrsPage />)}
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
