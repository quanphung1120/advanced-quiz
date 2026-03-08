import { Navigate, Outlet, Route, Routes, useLocation } from "react-router";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { ForgotPasswordPage } from "@/features/auth/components/forgot-password-page";
import { ResetPasswordPage } from "@/features/auth/components/reset-password-page";
import { SignInPage } from "@/features/auth/components/sign-in-page";
import { SignUpPage } from "@/features/auth/components/sign-up-page";
import { VerifyEmailPage } from "@/features/auth/components/verify-email-page";
import { CollectionPage } from "@/routes/dashboard/collection-page";
import { DashboardLayout } from "@/routes/dashboard/dashboard-layout";
import { DashboardPage } from "@/routes/dashboard/dashboard-page";
import { HomePage } from "@/routes/home-page";
import { LearnPage } from "@/routes/learn/learn-page";
import { SrsPage } from "@/routes/learn/srs-page";

function RequireAuth() {
  const location = useLocation();
  const { isAuthenticated, isPending } = useAuth();

  if (isPending) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardLayout isLoading={true} />
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

function RootLayout() {
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <Outlet />
    </div>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<HomePage />} />
        <Route element={<PublicOnly />}>
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

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

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
