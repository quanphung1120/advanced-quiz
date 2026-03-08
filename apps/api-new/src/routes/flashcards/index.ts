import { submitReviewBodySchema } from "@advanced-quiz/contracts";
import type { FastifyInstance, FastifyReply } from "fastify";
import { getCollectionAccess, serializeReviewProgress } from "../../lib/domain";
import { calculateNextReview } from "../../lib/srs";
import { and, db, eq, schema } from "../../lib/db";
import { authenticate } from "../../plugins/auth";

function sendError(
  reply: FastifyReply,
  statusCode: number,
  error: string,
  message: string,
) {
  return reply.code(statusCode).send({
    statusCode,
    error,
    message,
  });
}

export async function flashcardRoutes(app: FastifyInstance) {
  app.post(
    "/:id/review",
    {
      preHandler: [authenticate],
      schema: {
        tags: ["reviews"],
        summary: "Submit an SRS rating for a flashcard",
        security: [{ cookieAuth: [] }],
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = submitReviewBodySchema.parse(request.body);

      const flashcard = await db.query.flashcard.findFirst({
        where: eq(schema.flashcard.id, id),
      });

      if (!flashcard) {
        return sendError(reply, 404, "Not Found", "Flashcard not found");
      }

      const access = await getCollectionAccess(
        flashcard.collectionId,
        request.user!.id,
      );
      if (!access) {
        return sendError(reply, 404, "Not Found", "Collection not found");
      }

      let review = await db.query.flashcardReview.findFirst({
        where: and(
          eq(schema.flashcardReview.userId, request.user!.id),
          eq(schema.flashcardReview.flashcardId, id),
        ),
      });

      if (!review) {
        const [created] = await db
          .insert(schema.flashcardReview)
          .values({
            flashcardId: id,
            userId: request.user!.id,
            updatedAt: new Date(),
          })
          .returning();
        review = created;
      }

      const next = calculateNextReview(review, body.rating);
      const [updated] = await db
        .update(schema.flashcardReview)
        .set(next)
        .where(eq(schema.flashcardReview.id, review.id))
        .returning();

      return reply.send({
        review: serializeReviewProgress({
          ...updated,
          flashcard,
        }),
      });
    },
  );
}
