import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Link } from "react-router";
import { useForm } from "react-hook-form";
import {
  forgotPasswordBodySchema,
  type ForgotPasswordBody,
} from "@advanced-quiz/contracts";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {error ? <Alert variant="destructive">{error}</Alert> : null}
        {success ? <Alert variant="success">{success}</Alert> : null}

        <Field>
          <FieldLabel htmlFor="email">
            Email
          </FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            {...register("email", { required: "Email is required" })}
            className="rounded-none text-base focus:bg-background"
          />
          {errors.email ? <FieldError>{errors.email.message}</FieldError> : null}
        </Field>

        <Button
          type="submit"
          disabled={loading}
          size="lg"
          className="h-12 w-full bg-primary text-base font-bold text-primary-foreground hover:bg-primary/90"
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
