import { z } from "zod";
import { sharedEnvSchema } from "./shared.js";

/**
 * Server-side environment variables.
 * Used by the Fastify API and backend-only auth/database modules.
 */
export const serverEnvSchema = sharedEnvSchema.extend({
  DATABASE_URL: z.string().url(),
  AUTH_SECRET: z.string().min(32),
  API_URL: z.string().url().default("http://localhost:3001"),
  WEB_URL: z.string().url().default("http://localhost:5173"),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM_EMAIL: z.string().email(),
  PORT: z.coerce.number().default(3001),
  LOG_LEVEL: z.string().default("info"),
  ENABLE_DOCS: z.coerce.boolean().default(false),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function getServerEnv(): ServerEnv {
  return serverEnvSchema.parse(process.env);
}
