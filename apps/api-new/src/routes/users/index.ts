import type { FastifyInstance } from "fastify";
import { searchUserEmails } from "../../lib/domain";
import { authenticate } from "../../plugins/auth";

export async function userRoutes(app: FastifyInstance) {
  app.get(
    "/me",
    {
      preHandler: [authenticate],
      schema: {
        tags: ["users"],
        summary: "Get current user profile",
        security: [{ cookieAuth: [] }],
      },
    },
    async (request) => {
      return {
        user: {
          id: request.user!.id,
          name: request.user!.name,
          email: request.user!.email,
          emailVerified: request.user!.emailVerified,
          image: request.user!.image ?? null,
          emailAddresses: [request.user!.email],
        },
      };
    },
  );

  app.get(
    "/search-email-addresses",
    {
      preHandler: [authenticate],
      schema: {
        tags: ["users"],
        summary: "Search users by email address",
        security: [{ cookieAuth: [] }],
      },
    },
    async (request) => {
      const query = request.query as { query?: string } | undefined;
      if (!query?.query) {
        return {
          emails: [],
        };
      }

      return {
        emails: await searchUserEmails(query.query, request.user!.id),
      };
    },
  );
}
