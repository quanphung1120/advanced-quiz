import { z } from "zod";
import { sharedEnvSchema } from "./shared.js";

/**
 * Client-side environment variables.
 * In Vite, these must be prefixed with VITE_.
 */
const clientEnvSchema = sharedEnvSchema.extend({
  VITE_API_URL: z.string().url().default("http://localhost:3001"),
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;

let _clientEnv: ClientEnv | null = null;

export function getClientEnv(): ClientEnv {
  if (!_clientEnv) {
    // In Vite, import.meta.env contains VITE_ prefixed vars
    const raw =
      typeof import.meta !== "undefined" && import.meta.env
        ? import.meta.env
        : process.env;
    _clientEnv = clientEnvSchema.parse(raw);
  }
  return _clientEnv;
}
