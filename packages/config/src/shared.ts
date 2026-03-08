import { z } from "zod";

/**
 * Shared env vars used by both server and client
 */
export const sharedEnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

export type SharedEnv = z.infer<typeof sharedEnvSchema>;

export function getSharedEnv(): SharedEnv {
  return sharedEnvSchema.parse(process.env);
}
