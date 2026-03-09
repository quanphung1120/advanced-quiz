import { zodResolver } from "@hookform/resolvers/zod";
import { startTransition, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useForm } from "react-hook-form";
import {
  resetPasswordBodySchema,
  type ResetPasswordBody,
} from "@advanced-quiz/contracts";
import { Button } from "@/components/ui/button";
import { resetPassword } from "@/features/auth/api/auth-client";
import { AuthPageShell } from "./auth-page-shell";
import { PasswordRequirements } from "./password-requirements";

const inputClass =
  "w-full border border-border bg-background px-4 py-3.5 text-base text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary focus:bg-background";
const labelClass =
  "block text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground";
const errorClass = "text-sm font-medium text-destructive";
const successPanelClass =
  "border border-emerald-500/50 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-500 dark:text-emerald-400";
const errorPanelClass =
  "border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive";

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
    watch,
    formState: { errors },
  } = useForm<ResetPasswordBody>({
    resolver: zodResolver(resetPasswordBodySchema),
    defaultValues: {
      token,
      password: "",
      confirmPassword: "",
    },
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
          <div className={errorPanelClass}>
            This reset link is missing its token. Request a fresh recovery
            email.
          </div>
        )}

        {error && <div className={errorPanelClass}>{error}</div>}
        {success && <div className={successPanelClass}>{success}</div>}

        <div className="space-y-2">
          <label htmlFor="password" className={labelClass}>
            New password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="Create a strong password"
            {...register("password", { required: "Password is required" })}
            className={inputClass}
          />
          {errors.password && (
            <p className={errorClass}>{errors.password.message}</p>
          )}
          <PasswordRequirements password={watch("password")} />
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className={labelClass}>
            Confirm password
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Re-enter your new password"
            {...register("confirmPassword", {
              required: "Please confirm your password",
            })}
            className={inputClass}
          />
          {errors.confirmPassword && (
            <p className={errorClass}>{errors.confirmPassword.message}</p>
          )}
        </div>

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
