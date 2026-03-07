import { startTransition, type FormEvent, useState } from "react";
import { useNavigate } from "react-router";
import { signIn } from "@/features/auth/api/auth-client";
import { AuthPageShell } from "./auth-page-shell";
import { Button } from "@/components/ui/button";

export function SignInPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signIn.email({ email, password });
      if (result.error) {
        setError(result.error.message ?? "Authentication failed. Please check your credentials.");
      } else {
        startTransition(() => {
          navigate("/dashboard");
        });
      }
    } catch {
      setError("An unexpected error occurred during sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthPageShell
      title="Welcome Back"
      description="Study system ready. Sign in to continue your progress."
      footerText="Don't have an account?"
      footerActionLabel="Create account"
      footerActionTo="/sign-up"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3.5 text-[13px] font-semibold text-destructive/90 transition-all animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1"
          >
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="w-full rounded-lg border border-border bg-background px-4 py-3.5 text-sm ring-offset-background transition-all placeholder:text-muted-foreground/50 focus:border-primary/60 focus:bg-primary/5 focus:outline-none focus:ring-4 focus:ring-primary/5 font-medium"
            placeholder="name@company.com"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <label
              htmlFor="password"
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground"
            >
              Password
            </label>
            <button type="button" className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/80 hover:text-primary transition-colors">
              Forgot?
            </button>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="w-full rounded-lg border border-border bg-background px-4 py-3.5 text-sm ring-offset-background transition-all placeholder:text-muted-foreground/50 focus:border-primary/60 focus:bg-primary/5 focus:outline-none focus:ring-4 focus:ring-primary/5 font-medium"
            placeholder="••••••••"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          size="lg"
          className="w-full py-4 text-sm font-bold shadow-[0_8px_24px_oklch(0.52_0.26_258_/_0.3)] h-auto"
        >
          {loading ? "Authenticating…" : "Sign In to Workspace"}
        </Button>
      </form>
    </AuthPageShell>
  );
}
