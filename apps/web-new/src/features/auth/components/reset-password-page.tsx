import { zodResolver } from "@hookform/resolvers/zod";
import { startTransition, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useForm, useWatch } from "react-hook-form";
import {
  resetPasswordBodySchema,
  type ResetPasswordBody,
} from "@advanced-quiz/contracts";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { resetPassword } from "@/features/auth/api/auth-client";
import { AuthPageShell } from "./auth-page-shell";
import { PasswordRequirements } from "./password-requirements";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const token = useMemo(
    () => searchParams.get("token")?.trim() ?? "",
    [searchParams],
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ResetPasswordBody>({
    resolver: zodResolver(resetPasswordBodySchema),
    defaultValues: {
      token,
      password: "",
      confirmPassword: "",
    },
  });
  const passwordValue = useWatch({
    control,
    name: "password",
    defaultValue: "",
  });

  async function onSubmit(data: ResetPasswordBody) {
    if (!token) {
      setError("This reset link is invalid or incomplete.");
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);

    const result = await resetPassword({
      token,
      password: data.password,
      confirmPassword: data.confirmPassword,
    });

    if (result.error) {
      setError(result.error.message);
      setLoading(false);
      return;
    }

    setSuccess(result.data?.message ?? "Password updated successfully.");
    setLoading(false);
    startTransition(() => {
      navigate("/sign-in");
    });
  }

  return (
    <AuthPageShell
      title="Set a new password"
      description="Choose a fresh password for your account and keep your old one retired."
      footerText="Need a new reset email?"
      footerActionLabel="Sign in"
      footerActionTo="/sign-in"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <input type="hidden" {...register("token")} value={token} />

        {!token && (
          <Alert variant="destructive">
            This reset link is missing its token. Request a fresh recovery
            email.
          </Alert>
        )}

        {error ? <Alert variant="destructive">{error}</Alert> : null}
        {success ? <Alert variant="success">{success}</Alert> : null}

        <Field>
          <FieldLabel htmlFor="password">
            New password
          </FieldLabel>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="Create a strong password"
            {...register("password", { required: "Password is required" })}
            className="rounded-none text-base focus:bg-background"
          />
          {errors.password ? (
            <FieldError>{errors.password.message}</FieldError>
          ) : null}
          <PasswordRequirements password={passwordValue} />
        </Field>

        <Field>
          <FieldLabel htmlFor="confirmPassword">
            Confirm password
          </FieldLabel>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Re-enter your new password"
            {...register("confirmPassword", {
              required: "Please confirm your password",
            })}
            className="rounded-none text-base focus:bg-background"
          />
          {errors.confirmPassword ? (
            <FieldError>{errors.confirmPassword.message}</FieldError>
          ) : null}
        </Field>

        <Button
          type="submit"
          disabled={loading || !token}
          size="lg"
          className="h-12 w-full bg-primary text-base font-bold text-primary-foreground hover:bg-primary/90"
        >
          {loading ? "Updating password…" : "Update password"}
        </Button>

        <p className="text-center text-sm font-medium text-muted-foreground">
          Return to{" "}
          <Link
            to="/forgot-password"
            className="font-semibold text-foreground transition-colors hover:text-primary"
          >
            password recovery
          </Link>{" "}
          or{" "}
          <Link
            to="/sign-in"
            className="font-semibold text-foreground transition-colors hover:text-primary"
          >
            sign in
          </Link>
          .
        </p>
      </form>
    </AuthPageShell>
  );
}
