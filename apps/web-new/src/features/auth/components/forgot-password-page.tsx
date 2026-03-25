import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Link } from "react-router";
import { useForm } from "react-hook-form";
import {
  forgotPasswordBodySchema,
  type ForgotPasswordBody,
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
import { forgotPassword } from "@/features/auth/api/auth-client";
import { AuthPageShell } from "./auth-page-shell";

export function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordBody>({
    resolver: zodResolver(forgotPasswordBodySchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: ForgotPasswordBody) {
    setError(null);
    setSuccess(null);
    setLoading(true);

    const result = await forgotPassword({ email: data.email.trim() });

    if (result.error) {
      setError(result.error.message);
      setLoading(false);
      return;
    }

    setSuccess(
      result.data?.message ??
        "If an account exists for that email, password reset instructions have been sent.",
    );
    setLoading(false);
  }

  return (
    <AuthPageShell
      title="Recover access"
      description="Request a secure password reset link. For privacy, this form always responds the same way."
      footerText="Remembered your password?"
      footerActionLabel="Sign in"
      footerActionTo="/sign-in"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
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
          <Field data-invalid={errors.email ? true : undefined}>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <FieldContent>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                aria-invalid={errors.email ? true : undefined}
                {...register("email", { required: "Email is required" })}
                className="h-12 bg-background px-4 text-base"
              />
              <FieldError errors={errors.email ? [errors.email] : undefined} />
            </FieldContent>
          </Field>
        </FieldGroup>

        <Button
          type="submit"
          disabled={loading}
          size="lg"
          className="h-12 w-full text-base font-bold"
        >
          {loading ? "Sending reset link…" : "Send reset link"}
        </Button>

        <p className="text-center text-sm font-medium text-muted-foreground">
          Need to verify a new account?{" "}
          <Link
            to="/verify-email"
            className="font-semibold text-foreground transition-colors hover:text-primary"
          >
            Enter a verification code
          </Link>
          .
        </p>
      </form>
    </AuthPageShell>
  );
}
