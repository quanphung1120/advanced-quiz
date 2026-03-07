import { createAuthClient } from "better-auth/react";

/**
 * Better Auth client factory for the React app.
 * Uses VITE_API_URL to point to the Fastify backend.
 */
export const authClient = createAuthClient({
  baseURL: import.meta.env?.VITE_API_URL ?? "http://localhost:3001",
});

export const { useSession, signIn, signUp, signOut } = authClient;
