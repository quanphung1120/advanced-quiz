import { startTransition, type FormEvent, useState } from "react";
import { useNavigate } from "react-router";
import { signUp } from "@/features/auth/api/auth-client";
import { AuthPageShell } from "./auth-page-shell";
import { Button } from "@/components/ui/button";

export function SignUpPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signUp.email({ email, password, name });
      if (result.error) {
        setError(result.error.message ?? "Registration failed. Please check your details.");
      } else {
        startTransition(() => {
          navigate("/dashboard");
        });
      }
    } catch {
      setError("An unexpected error occurred during registration.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthPageShell
      title="Join the System"
      description="Create an account to start building your personal study workspace."
      footerText="Already have an account?"
      footerActionLabel="Sign in"
      footerActionTo="/sign-in"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3.5 text-[13px] font-semibold text-destructive/90 transition-all animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label
            htmlFor="name"
            className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1"
          >
            Full Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            className="w-full rounded-lg border border-border bg-background px-4 py-3.5 text-sm ring-offset-background transition-all placeholder:text-muted-foreground/50 focus:border-primary/60 focus:bg-primary/5 focus:outline-none focus:ring-4 focus:ring-primary/5 font-medium"
            placeholder="Alex Carter"
          />
        </div>

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
          <label
            htmlFor="password"
            className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="w-full rounded-lg border border-border bg-background px-4 py-3.5 text-sm ring-offset-background transition-all placeholder:text-muted-foreground/50 focus:border-primary/60 focus:bg-primary/5 focus:outline-none focus:ring-4 focus:ring-primary/5 font-medium"
            placeholder="Min. 8 characters"
          />
        </div>

        <div className="space-y-4 pt-2">
          <p className="text-[11px] text-muted-foreground/70 text-center font-medium">
            By signing up, you agree to our Terms of Service and Privacy Policy.
          </p>
          <Button
            type="submit"
            disabled={loading}
            size="lg"
            className="w-full py-4 text-sm font-bold shadow-[0_8px_24px_oklch(0.52_0.26_258_/_0.3)] h-auto"
          >
            {loading ? "Creating Account…" : "Generate Access Trace"}
          </Button>
        </div>
      </form>
    </AuthPageShell>
  );
}
