import fp from "fastify-plugin";
import cookie from "@fastify/cookie";
import type { FastifyInstance } from "fastify";

/**
 * Cookie plugin with secure defaults.
 * SameSite=lax works for same-site local dev (localhost:5173 → localhost:3001).
 */
export const cookiePlugin = fp(async (app: FastifyInstance) => {
  await app.register(cookie, {
    secret: process.env.BETTER_AUTH_SECRET,
    parseOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    },
  });
});
