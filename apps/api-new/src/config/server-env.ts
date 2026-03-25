import { z } from "zod";

export const serverEnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  DATABASE_URL: z.string().url(),
  AUTH_SECRET: z.string().min(32),
  API_URL: z.string().url().default("http://localhost:3001"),
  WEB_URL: z.string().url().default("http://localhost:5173"),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM_EMAIL: z.string().email(),
  AI_GATEWAY_API_KEY: z.string().min(1).optional(),
  AI_PRIMARY_MODEL: z.string().min(1).default("zai/glm-4.7-flashx"),
  AI_BACKGROUND_MODEL: z.string().min(1).default("openai/gpt-4.1-nano"),
  ENABLE_AI_DEVTOOLS: z.coerce.boolean().default(false),
  PORT: z.coerce.number().default(3001),
  LOG_LEVEL: z.string().default("info"),
  ENABLE_DOCS: z.coerce.boolean().default(false),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cachedServerEnv: ServerEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (!cachedServerEnv) {
    cachedServerEnv = serverEnvSchema.parse(process.env);
  }

  return cachedServerEnv;
}
