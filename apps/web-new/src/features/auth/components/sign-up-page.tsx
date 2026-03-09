import { zodResolver } from "@hookform/resolvers/zod";
import { startTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { signUpBodySchema, type SignUpBody } from "@advanced-quiz/contracts";
import { Button } from "@/components/ui/button";
import { signUp } from "@/features/auth/api/auth-client";
import { AuthPageShell } from "./auth-page-shell";
import { PasswordRequirements } from "./password-requirements";

const inputClass =
  "w-full border border-border bg-background px-4 py-3.5 text-base text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary focus:bg-background";
const labelClass =
  "block text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground";
const errorClass = "text-sm font-medium text-destructive";
const errorPanelClass =
  "border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive";

export function SignUpPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpBody>({
    resolver: zodResolver(signUpBodySchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  async function onSubmit(data: SignUpBody) {
    setError(null);
    setLoading(true);

    try {
      const result = await signUp.email(data);
      if (result.error) {
        setError(
          result.error.message ??
            "Registration failed. Please check your details.",
        );
        return;
      }

      const email = result.data?.email ?? data.email;
      startTransition(() => {
        navigate(`/verify-email?email=${encodeURIComponent(email)}`);
      });
    } catch {
      setError("An unexpected error occurred during registration.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthPageShell
      title="Create account"
      description="Start building your personal study workspace."
      footerText="Already have an account?"
      footerActionLabel="Sign in"
      footerActionTo="/sign-in"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {error && <div className={errorPanelClass}>{error}</div>}

        <div className="space-y-2">
          <label htmlFor="name" className={labelClass}>
            Full name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Alex Carter"
            {...register("name")}
            className={inputClass}
          />
          {errors.name && <p className={errorClass}>{errors.name.message}</p>}
        </div>

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
          <label htmlFor="password" className={labelClass}>
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="Create a strong password"
            {...register("password")}
            className={inputClass}
          />
          {errors.password && (
            <p className={errorClass}>{errors.password.message}</p>
          )}
          <PasswordRequirements password={watch("password")} />
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className={labelClass}>
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Re-enter password"
            {...register("confirmPassword")}
            className={inputClass}
          />
          {errors.confirmPassword && (
            <p className={errorClass}>{errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="space-y-4 pt-1">
          <Button
            type="submit"
            disabled={loading}
            size="lg"
            className="h-12 w-full bg-primary text-base font-bold text-primary-foreground hover:bg-primary/90"
          >
            {loading ? "Creating account…" : "Create account"}
          </Button>
          <p className="text-center text-sm font-medium text-muted-foreground">
            By continuing, you agree to our Terms &amp; Privacy Policy.
          </p>
        </div>
      </form>
    </AuthPageShell>
  );
}
