import { zodResolver } from "@hookform/resolvers/zod";
import { startTransition, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useForm, useWatch } from "react-hook-form";
import {
  resetPasswordBodySchema,
  type ResetPasswordBody,
} from "@advanced-quiz/contracts";
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
import { resetPassword } from "@/features/auth/api/auth-client";
import { AuthPageShell } from "./auth-page-shell";
import { PasswordRequirements } from "./password-requirements";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const token = searchParams.get("token")?.trim() ?? "";

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
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <input type="hidden" {...register("token")} value={token} />

        {!token ? (
          <Alert variant="destructive">
            <AlertDescription>
              This reset link is missing its token. Request a fresh recovery
              email.
            </AlertDescription>
          </Alert>
        ) : null}

        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        {success ? (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        ) : null}

        <FieldGroup>
          <Field data-invalid={errors.password ? true : undefined}>
            <FieldLabel htmlFor="password">New password</FieldLabel>
            <FieldContent>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="Create a strong password"
                aria-invalid={errors.password ? true : undefined}
                {...register("password", { required: "Password is required" })}
                className="h-12 bg-background px-4 text-base"
              />
              <FieldError
                errors={errors.password ? [errors.password] : undefined}
              />
              <PasswordRequirements password={passwordValue} />
            </FieldContent>
          </Field>

          <Field data-invalid={errors.confirmPassword ? true : undefined}>
            <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
            <FieldContent>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Re-enter your new password"
                aria-invalid={errors.confirmPassword ? true : undefined}
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                })}
                className="h-12 bg-background px-4 text-base"
              />
              <FieldError
                errors={
                  errors.confirmPassword ? [errors.confirmPassword] : undefined
                }
              />
            </FieldContent>
          </Field>
        </FieldGroup>

        <Button
          type="submit"
          disabled={loading || !token}
          size="lg"
          className="h-12 w-full text-base font-bold"
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
