import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Link } from "react-router";
import { useForm } from "react-hook-form";
import {
  forgotPasswordBodySchema,
  type ForgotPasswordBody,
} from "@advanced-quiz/contracts";
import { Button } from "@/components/ui/button";
import { forgotPassword } from "@/features/auth/api/auth-client";
import { AuthPageShell } from "./auth-page-shell";
import {
  errorClass,
  errorPanelClass,
  inputClass,
  labelClass,
  successPanelClass,
} from "./auth-form-styles";

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
        {error && <div className={errorPanelClass}>{error}</div>}
        {success && <div className={successPanelClass}>{success}</div>}

        <div className="space-y-2">
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            {...register("email", { required: "Email is required" })}
            className={inputClass}
          />
          {errors.email && <p className={errorClass}>{errors.email.message}</p>}
        </div>

        <Button
          type="submit"
          disabled={loading}
          size="lg"
          className="h-12 w-full bg-[#D9FF00] text-base font-bold text-black hover:bg-[#c2e600]"
        >
          {loading ? "Sending reset link…" : "Send reset link"}
        </Button>

        <p className="text-center text-sm font-medium text-gray-500">
          Need to verify a new account?{" "}
          <Link
            to="/verify-email"
            className="font-semibold text-white transition-colors hover:text-[#D9FF00]"
          >
            Enter a verification code
          </Link>
          .
        </p>
      </form>
    </AuthPageShell>
  );
}
