import { zodResolver } from "@hookform/resolvers/zod";
import { startTransition, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useNavigate } from "react-router";
import { signUpBodySchema, type SignUpBody } from "@advanced-quiz/contracts";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { signUp } from "@/features/auth/api/auth-client";
import { AuthPageShell } from "./auth-page-shell";
import { PasswordRequirements } from "./password-requirements";

export function SignUpPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SignUpBody>({
    resolver: zodResolver(signUpBodySchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });
  const passwordValue = useWatch({
    control,
    name: "password",
    defaultValue: "",
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
        {error ? <Alert variant="destructive">{error}</Alert> : null}

        <Field>
          <FieldLabel htmlFor="name">
            Full name
          </FieldLabel>
          <Input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Alex Carter"
            {...register("name")}
            className="rounded-none text-base focus:bg-background"
          />
          {errors.name ? <FieldError>{errors.name.message}</FieldError> : null}
        </Field>

        <Field>
          <FieldLabel htmlFor="email">
            Email
          </FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            {...register("email")}
            className="rounded-none text-base focus:bg-background"
          />
          {errors.email ? <FieldError>{errors.email.message}</FieldError> : null}
        </Field>

        <Field>
          <FieldLabel htmlFor="password">
            Password
          </FieldLabel>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="Create a strong password"
            {...register("password")}
            className="rounded-none text-base focus:bg-background"
          />
          {errors.password ? (
            <FieldError>{errors.password.message}</FieldError>
          ) : null}
          <PasswordRequirements password={passwordValue} />
        </Field>

        <Field>
          <FieldLabel htmlFor="confirmPassword">
            Confirm Password
          </FieldLabel>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Re-enter password"
            {...register("confirmPassword")}
            className="rounded-none text-base focus:bg-background"
          />
          {errors.confirmPassword ? (
            <FieldError>{errors.confirmPassword.message}</FieldError>
          ) : null}
        </Field>

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
