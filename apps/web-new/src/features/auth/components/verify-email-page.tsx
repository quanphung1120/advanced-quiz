import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { startTransition, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router";
import { useForm, useWatch } from "react-hook-form";
import {
  verifyEmailBodySchema,
  type VerifyEmailBody,
} from "@advanced-quiz/contracts";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
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

  const initialEmail = useMemo(
    () => searchParams.get("email")?.trim() ?? "",
    [searchParams],
  );

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

        <Field>
          <FieldLabel htmlFor="otp">
            Verification code
          </FieldLabel>
          <Input
            id="otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="123456"
            {...register("otp", { required: "Verification code is required" })}
            className="rounded-none text-base focus:bg-background"
          />
          {errors.otp ? <FieldError>{errors.otp.message}</FieldError> : null}
          <FieldDescription>
            The code expires quickly. If it has lapsed, request a new one.
          </FieldDescription>
        </Field>

        <div className="space-y-3">
          <Button
            type="submit"
            disabled={loading}
            size="lg"
            className="h-12 w-full bg-primary text-base font-bold text-primary-foreground hover:bg-primary/90"
          >
            {loading ? "Verifying…" : "Verify email"}
          </Button>
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="w-full text-center text-sm font-semibold text-muted-foreground transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {resending ? "Sending a new code…" : "Resend verification code"}
          </button>
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
