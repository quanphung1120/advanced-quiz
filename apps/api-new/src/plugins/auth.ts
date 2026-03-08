import fp from "fastify-plugin";
import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { auth } from "../lib/auth";

/**
 * Auth plugin — decorates Fastify with:
 *   - request.user  (typed session user or null)
 *   - authenticate  pre-handler that gates protected routes
 */

// Extend Fastify types
declare module "fastify" {
  interface FastifyRequest {
    user: {
      id: string;
      name: string;
      email: string;
      emailVerified: boolean;
      image?: string | null;
    } | null;
  }
}

export const authPlugin = fp(async (app: FastifyInstance) => {
  // Decorate all requests with null user by default
  app.decorateRequest("user", null);

  // Resolve session on every request (non-blocking)
  app.addHook("onRequest", async (request) => {
    try {
      const session = await auth.api.getSession({
        headers: request.headers as unknown as Headers,
      });
      if (session?.user) {
        request.user = session.user;
      }
    } catch {
      // No valid session — user stays null
    }
  });
});

/**
 * Pre-handler that requires an authenticated session.
 * Attach to individual routes or route groups:
 *
 *   app.get("/me", { preHandler: [authenticate] }, handler)
 */
export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  if (!request.user) {
    return reply.code(401).send({
      statusCode: 401,
      error: "Unauthorized",
      message: "Authentication required",
    });
  }
}
