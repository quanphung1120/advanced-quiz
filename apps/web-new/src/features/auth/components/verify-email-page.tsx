import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { startTransition, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router";
import { useForm, useWatch } from "react-hook-form";
import {
  verifyEmailBodySchema,
  type VerifyEmailBody,
} from "@advanced-quiz/contracts";
import {
  Alert,
  AlertDescription,
} from "@advanced-quiz/ui/components/alert";
import { Button } from "@advanced-quiz/ui/components/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@advanced-quiz/ui/components/field";
import { Input } from "@advanced-quiz/ui/components/input";
import {
  resendVerification,
  verifyEmail,
} from "@/features/auth/api/auth-client";
import { AuthPageShell } from "./auth-page-shell";

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const initialNotice =
    typeof location.state === "object" &&
    location.state !== null &&
    "notice" in location.state &&
    typeof location.state.notice === "string"
      ? location.state.notice
      : null;
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(initialNotice);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const initialEmail = searchParams.get("email")?.trim() ?? "";

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<VerifyEmailBody>({
    resolver: zodResolver(verifyEmailBodySchema),
    defaultValues: {
      email: initialEmail,
      otp: "",
    },
  });

  const emailValue = useWatch({
    control,
    name: "email",
    defaultValue: initialEmail,
  });

  async function onSubmit(data: VerifyEmailBody) {
    setError(null);
    setSuccess(null);
    setLoading(true);

    const result = await verifyEmail({
      email: data.email.trim(),
      otp: data.otp.replace(/\D/g, ""),
    });

    if (result.error) {
      setError(result.error.message);
      setLoading(false);
      return;
    }

    await queryClient.invalidateQueries({ queryKey: ["session"] });
    setSuccess("Email verified. Redirecting to your dashboard.");
    setLoading(false);
    startTransition(() => {
      navigate("/dashboard");
    });
  }

  async function handleResend() {
    if (!emailValue.trim()) {
      setError("Enter your email address first.");
      return;
    }

    setError(null);
    setSuccess(null);
    setResending(true);

    const result = await resendVerification({ email: emailValue.trim() });
    setResending(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    setSuccess(
      result.data?.message ?? "A fresh verification code has been sent.",
    );
  }

  return (
    <AuthPageShell
      title="Verify your email"
      description="Enter the one-time code we sent to finish setting up your account."
      footerText="Already verified?"
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

          <Field data-invalid={errors.otp ? true : undefined}>
            <FieldLabel htmlFor="otp">Verification code</FieldLabel>
            <FieldContent>
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="123456"
                aria-invalid={errors.otp ? true : undefined}
                {...register("otp", {
                  required: "Verification code is required",
                })}
                className="h-12 bg-background px-4 text-base"
              />
              <FieldError errors={errors.otp ? [errors.otp] : undefined} />
              <FieldDescription>
                The code expires quickly. If it has lapsed, request a new one.
              </FieldDescription>
            </FieldContent>
          </Field>
        </FieldGroup>

        <div className="flex flex-col gap-3">
          <Button
            type="submit"
            disabled={loading}
            size="lg"
            className="h-12 w-full text-base font-bold"
          >
            {loading ? "Verifying…" : "Verify email"}
          </Button>
          <Button
            type="button"
            onClick={handleResend}
            disabled={resending}
            variant="ghost"
            className="h-auto w-full justify-center px-0"
          >
            {resending ? "Sending a new code…" : "Resend verification code"}
          </Button>
        </div>

        <p className="text-center text-sm font-medium text-muted-foreground">
          Need password recovery instead?{" "}
          <Link
            to="/forgot-password"
            className="font-semibold text-foreground transition-colors hover:text-primary"
          >
            Reset it here
          </Link>
          .
        </p>
      </form>
    </AuthPageShell>
  );
}
