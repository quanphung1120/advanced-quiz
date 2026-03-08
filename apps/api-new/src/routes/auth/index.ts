import type { FastifyInstance } from "fastify";
import { auth } from "../../lib/auth";

/**
 * Auth routes — delegates ALL /auth/* to Better Auth's built-in handler.
 * Better Auth manages sign-up, sign-in, sign-out, session, verification, etc.
 */
export async function authRoutes(app: FastifyInstance) {
  app.all(
    "/*",
    {
      schema: {
        tags: ["auth"],
        summary:
          "Better Auth handler (sign-up, sign-in, sign-out, session, etc.)",
        hide: true, // hide catch-all from Swagger; individual endpoints documented by Better Auth
      },
    },
    async (request, reply) => {
      // Convert Fastify request → Web Request for Better Auth
      const url = new URL(
        request.url,
        `${request.protocol}://${request.hostname}`,
      );

      const headers = new Headers();
      for (const [key, value] of Object.entries(request.headers)) {
        if (value) {
          if (Array.isArray(value)) {
            for (const v of value) headers.append(key, v);
          } else {
            headers.set(key, value);
          }
        }
      }

      const webRequest = new Request(url.toString(), {
        method: request.method,
        headers,
        body:
          request.method !== "GET" && request.method !== "HEAD"
            ? JSON.stringify(request.body)
            : undefined,
      });

      const response = await auth.handler(webRequest);

      // Forward status
      reply.status(response.status);

      // Forward headers (including Set-Cookie)
      response.headers.forEach((value, key) => {
        reply.header(key, value);
      });

      // Forward body
      const body = await response.text();
      return reply.send(body);
    },
  );
}
