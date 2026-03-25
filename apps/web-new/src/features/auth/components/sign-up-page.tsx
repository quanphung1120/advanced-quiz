import { zodResolver } from "@hookform/resolvers/zod";
import { startTransition, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useNavigate } from "react-router";
import { signUpBodySchema, type SignUpBody } from "@advanced-quiz/contracts";
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
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <FieldGroup>
          <Field data-invalid={errors.name ? true : undefined}>
            <FieldLabel htmlFor="name">Full name</FieldLabel>
            <FieldContent>
              <Input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="Alex Carter"
                aria-invalid={errors.name ? true : undefined}
                {...register("name")}
                className="h-12 bg-background px-4 text-base"
              />
              <FieldError errors={errors.name ? [errors.name] : undefined} />
            </FieldContent>
          </Field>

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
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <FieldContent>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="Create a strong password"
                aria-invalid={errors.password ? true : undefined}
                {...register("password")}
                className="h-12 bg-background px-4 text-base"
              />
              <FieldError
                errors={errors.password ? [errors.password] : undefined}
              />
              <PasswordRequirements password={passwordValue} />
            </FieldContent>
          </Field>

          <Field data-invalid={errors.confirmPassword ? true : undefined}>
            <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
            <FieldContent>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Re-enter password"
                aria-invalid={errors.confirmPassword ? true : undefined}
                {...register("confirmPassword")}
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

        <div className="flex flex-col gap-4 pt-1">
          <Button
            type="submit"
            disabled={loading}
            size="lg"
            className="h-12 w-full text-base font-bold"
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
