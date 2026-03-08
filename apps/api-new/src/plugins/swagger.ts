import fp from "fastify-plugin";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import type { FastifyInstance } from "fastify";

/**
 * Swagger / OpenAPI plugin.
 * - /docs     → Swagger UI
 * - /docs-json → raw OpenAPI spec
 *
 * Enabled in non-production by default. Set ENABLE_DOCS=true to expose in prod.
 */
export const swaggerPlugin = fp(async (app: FastifyInstance) => {
  const isProd = process.env.NODE_ENV === "production";
  const enableDocs = !isProd || process.env.ENABLE_DOCS === "true";

  if (!enableDocs) return;

  await app.register(swagger, {
    openapi: {
      openapi: "3.1.0",
      info: {
        title: "Advanced Quiz API",
        description:
          "Flashcard & spaced-repetition API powered by Fastify + Better Auth",
        version: "0.1.0",
      },
      servers: [
        {
          url: process.env.API_URL ?? "http://localhost:3001",
          description:
            process.env.NODE_ENV === "production"
              ? "Production"
              : "Development",
        },
      ],
      components: {
        securitySchemes: {
          cookieAuth: {
            type: "apiKey",
            in: "cookie",
            name: "better-auth.session_token",
            description: "Better Auth session cookie",
          },
        },
      },
    },
  });

  await app.register(swaggerUi, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: true,
    },
  });
});
