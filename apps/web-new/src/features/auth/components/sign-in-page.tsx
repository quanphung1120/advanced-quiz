import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { startTransition, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { signInBodySchema, type SignInBody } from "@advanced-quiz/contracts";
import {
  Alert,
  AlertDescription,
} from "@advanced-quiz/ui/components/alert";
import { Button } from "@advanced-quiz/ui/components/button";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@advanced-quiz/ui/components/field";
import { Input } from "@advanced-quiz/ui/components/input";
import { resendVerification, signIn } from "@/features/auth/api/auth-client";
import { AuthPageShell } from "./auth-page-shell";

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
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
            {showVerificationActions ? (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Link
                  to={`/verify-email?email=${encodeURIComponent(emailValue ?? "")}`}
                  className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
                >
                  Enter verification code
                </Link>
                <Button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendState.loading}
                  variant="link"
                  className="h-auto px-0"
                >
                  {resendState.loading ? "Resending…" : "Resend code"}
                </Button>
              </div>
            ) : null}
          </Alert>
        ) : null}

        {resendState.message ? (
          <Alert>
            <AlertDescription>{resendState.message}</AlertDescription>
          </Alert>
        ) : null}

        {resendState.error ? (
          <Alert variant="destructive">
            <AlertDescription>{resendState.error}</AlertDescription>
          </Alert>
        ) : null}

        <FieldGroup>
          <Field data-invalid={errors.email ? true : undefined}>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <FieldContent>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                aria-invalid={errors.email ? true : undefined}
                {...register("email")}
                className="h-12 bg-background px-4 text-base"
              />
              <FieldError errors={errors.email ? [errors.email] : undefined} />
            </FieldContent>
          </Field>

          <Field data-invalid={errors.password ? true : undefined}>
            <div className="flex items-center justify-between gap-3">
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Link
                to="/forgot-password"
                className="text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
              >
                Forgot?
              </Link>
            </div>
            <FieldContent>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                aria-invalid={errors.password ? true : undefined}
                {...register("password")}
                className="h-12 bg-background px-4 text-base"
              />
              <FieldError
                errors={errors.password ? [errors.password] : undefined}
              />
            </FieldContent>
          </Field>
        </FieldGroup>

        <Button
          type="submit"
          disabled={loading}
          size="lg"
          className="h-12 w-full text-base font-bold"
        >
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthPageShell>
  );
}
