import fp from "fastify-plugin";
import cors from "@fastify/cors";
import type { FastifyInstance } from "fastify";

/**
 * CORS plugin.
 * Allows the Vite dev server (WEB_URL) to make credentialed requests.
 */
export const corsPlugin = fp(async (app: FastifyInstance) => {
  const origin =
    process.env.CORS_ORIGIN ?? process.env.WEB_URL ?? "http://localhost:5173";

  await app.register(cors, {
    origin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
  });
});
