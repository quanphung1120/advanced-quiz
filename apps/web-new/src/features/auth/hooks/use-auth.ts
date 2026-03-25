import { signOut, useSession } from "@/features/auth/api/auth-client";

export { useSession, signOut };

/**
 * Hook that returns whether the user is authenticated.
 * Useful for guarding components.
 */
export function useAuth() {
  const session = useSession();

  return {
    user: session.data?.user ?? null,
    error: session.error,
    isPending: session.isPending,
    isAuthenticated: !!session.data?.user,
    signOut,
  };
}
