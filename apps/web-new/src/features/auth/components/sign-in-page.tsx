import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { startTransition, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { signInBodySchema, type SignInBody } from "@advanced-quiz/contracts";
import { Button } from "@/components/ui/button";
import { resendVerification, signIn } from "@/features/auth/api/auth-client";
import { AuthPageShell } from "./auth-page-shell";

const inputClass =
  "w-full border border-border bg-background px-4 py-3.5 text-base text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary focus:bg-background";
const labelClass =
  "block text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground";
const errorClass = "text-sm font-medium text-destructive";
const successPanelClass =
  "border border-emerald-500/50 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-500 dark:text-emerald-400";
const errorPanelClass =
  "border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive";

export function SignInPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendState, setResendState] = useState<{
    loading: boolean;
    message: string | null;
    error: string | null;
  }>({
    loading: false,
    message: null,
    error: null,
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SignInBody>({
    resolver: zodResolver(signInBodySchema),
    defaultValues: { email: "", password: "" },
  });

  const emailValue = useWatch({
    control,
    name: "email",
    defaultValue: "",
  });
  const showVerificationActions =
    error?.toLowerCase().includes("verify") ||
    error?.toLowerCase().includes("verification") ||
    false;

  async function onSubmit(data: SignInBody) {
    setError(null);
    setResendState({ loading: false, message: null, error: null });
    setLoading(true);

    try {
      const result = await signIn.email(data);
      if (result.error) {
        if (
          result.error.requiresEmailVerification ||
          result.error.code === "EMAIL_VERIFICATION_REQUIRED"
        ) {
          const email = result.error.email ?? data.email.trim();
          startTransition(() => {
            navigate(`/verify-email?email=${encodeURIComponent(email)}`, {
              state: {
                notice:
                  "We sent a verification code to your email. Enter it to finish signing in.",
              },
            });
          });
          return;
        }

        setError(
          result.error.message ??
            "Authentication failed. Please check your credentials.",
        );
        return;
      }

      await queryClient.invalidateQueries({ queryKey: ["session"] });
      startTransition(() => {
        navigate("/dashboard");
      });
    } catch {
      setError("An unexpected error occurred during sign in.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResendVerification() {
    if (!emailValue) {
      setResendState({
        loading: false,
        message: null,
        error: "Enter your email address first.",
      });
      return;
    }

    setResendState({ loading: true, message: null, error: null });
    const result = await resendVerification({ email: emailValue });
    setResendState({
      loading: false,
      message: result.data?.message ?? null,
      error: result.error?.message ?? null,
    });
  }

  return (
    <AuthPageShell
      title="Welcome back"
      description="Sign in to continue your progress."
      footerText="Don't have an account?"
      footerActionLabel="Create one"
      footerActionTo="/sign-up"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {error && (
          <div className={errorPanelClass}>
            <p>{error}</p>
            {showVerificationActions && (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Link
                  to={`/verify-email?email=${encodeURIComponent(emailValue ?? "")}`}
                  className="text-sm font-semibold text-foreground transition-colors hover:text-primary"
                >
                  Enter verification code
                </Link>
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendState.loading}
                  className="text-sm font-semibold text-primary transition-colors hover:opacity-80 disabled:cursor-not-allowed disabled:text-muted-foreground"
                >
                  {resendState.loading ? "Resending…" : "Resend code"}
                </button>
              </div>
            )}
          </div>
        )}

        {resendState.message && (
          <div className={successPanelClass}>{resendState.message}</div>
        )}

        {resendState.error && (
          <div className={errorPanelClass}>{resendState.error}</div>
        )}

        <div className="space-y-2">
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            {...register("email")}
            className={inputClass}
          />
          {errors.email && <p className={errorClass}>{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className={labelClass}>
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
            >
              Forgot?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            {...register("password")}
            className={inputClass}
          />
          {errors.password && (
            <p className={errorClass}>{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={loading}
          size="lg"
          className="h-12 w-full bg-primary text-base font-bold text-primary-foreground hover:bg-primary/90"
        >
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthPageShell>
  );
}
