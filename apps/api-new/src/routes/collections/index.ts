import {
  addCollaboratorBodySchema,
  createCollectionBodySchema,
  createFlashcardBodySchema,
  updateCollectionBodySchema,
  updateFlashcardBodySchema,
} from "@advanced-quiz/contracts";
import type { FastifyInstance, FastifyReply } from "fastify";
import {
  canEditCollection,
  canManageCollaborators,
  findUserByEmail,
  getCollectionAccess,
  listCollectionsForUser,
  serializeCollection,
  serializeCollaborator,
  serializeFlashcard,
  serializeReviewProgress,
} from "../../lib/domain";
import { buildCollectionStats } from "../../lib/srs";
import { and, asc, db, eq, inArray, schema } from "../../lib/db";
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

async function getCollectionFlashcards(collectionId: string) {
  return db.query.flashcard.findMany({
    where: eq(schema.flashcard.collectionId, collectionId),
    orderBy: [asc(schema.flashcard.createdAt)],
  });
}

async function getReviewRowsForCollection(collectionId: string, userId: string) {
  const flashcards = await getCollectionFlashcards(collectionId);
  if (flashcards.length === 0) {
    return [];
  }

  const flashcardIds = flashcards.map((flashcard) => flashcard.id);
  const flashcardMap = new Map(
    flashcards.map((flashcard) => [flashcard.id, flashcard] as const),
  );

  const reviews = await db.query.flashcardReview.findMany({
    where: and(
      eq(schema.flashcardReview.userId, userId),
      inArray(schema.flashcardReview.flashcardId, flashcardIds),
    ),
    orderBy: [asc(schema.flashcardReview.dueAt)],
  });

  return reviews.map((review) => ({
    ...review,
    flashcard: flashcardMap.get(review.flashcardId),
  }));
}

export async function collectionRoutes(app: FastifyInstance) {
  app.get(
    "/me",
    {
      preHandler: [authenticate],
      schema: {
        tags: ["collections"],
        summary: "List current user's owned and shared collections",
        security: [{ cookieAuth: [] }],
      },
    },
    async (request) => {
      return listCollectionsForUser(request.user!.id);
    },
  );

  app.post(
    "/",
    {
      preHandler: [authenticate],
      schema: {
        tags: ["collections"],
        summary: "Create a collection",
        security: [{ cookieAuth: [] }],
      },
    },
    async (request, reply) => {
      const body = createCollectionBodySchema.parse(request.body);

      const [created] = await db
        .insert(schema.collection)
        .values({
          name: body.name,
          description: body.description ?? null,
          isPublic: body.isPublic ?? false,
          ownerId: request.user!.id,
          updatedAt: new Date(),
        })
        .returning();

      return reply.code(201).send(serializeCollection(created));
    },
  );

  app.get(
    "/:id",
    {
      preHandler: [authenticate],
      schema: {
        tags: ["collections"],
        summary: "Get a single collection",
        security: [{ cookieAuth: [] }],
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      const access = await getCollectionAccess(id, request.user!.id);
      if (!access) {
        return sendError(reply, 404, "Not Found", "Collection not found");
      }

      return {
        collection: serializeCollection(access.collection),
        role: access.role,
      };
    },
  );

  app.put(
    "/:id",
    {
      preHandler: [authenticate],
      schema: {
        tags: ["collections"],
        summary: "Update a collection",
        security: [{ cookieAuth: [] }],
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = updateCollectionBodySchema.parse(request.body);

      const access = await getCollectionAccess(id, request.user!.id);
      if (!access) {
        return sendError(reply, 404, "Not Found", "Collection not found");
      }
      if (!canEditCollection(access.role)) {
        return sendError(reply, 403, "Forbidden", "Permission denied");
      }

      const [updated] = await db
        .update(schema.collection)
        .set({
          name: body.name ?? access.collection.name,
          description:
            body.description !== undefined
              ? body.description
              : access.collection.description,
          isPublic:
            body.isPublic !== undefined
              ? body.isPublic
              : access.collection.isPublic,
          updatedAt: new Date(),
        })
        .where(eq(schema.collection.id, id))
        .returning();

      if (!updated) {
        return sendError(reply, 404, "Not Found", "Collection not found");
      }

      return serializeCollection({
        ...updated,
        collaborators: access.collection.collaborators,
      });
    },
  );

  app.delete(
    "/:id",
    {
      preHandler: [authenticate],
      schema: {
        tags: ["collections"],
        summary: "Delete a collection",
        security: [{ cookieAuth: [] }],
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      const access = await getCollectionAccess(id, request.user!.id);
      if (!access) {
        return sendError(reply, 404, "Not Found", "Collection not found");
      }
      if (access.role !== "owner") {
        return sendError(reply, 403, "Forbidden", "Permission denied");
      }

      await db.delete(schema.collection).where(eq(schema.collection.id, id));

      return reply.send({ message: "Collection deleted successfully" });
    },
  );

  app.post(
    "/:id/collaborators",
    {
      preHandler: [authenticate],
      schema: {
        tags: ["collections"],
        summary: "Add collaborator",
        security: [{ cookieAuth: [] }],
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = addCollaboratorBodySchema.parse(request.body);

      const access = await getCollectionAccess(id, request.user!.id);
      if (!access) {
        return sendError(reply, 404, "Not Found", "Collection not found");
      }
      if (!canManageCollaborators(access.role)) {
        return sendError(reply, 403, "Forbidden", "Permission denied");
      }

      const targetUser = await findUserByEmail(body.email);
      if (!targetUser) {
        return sendError(reply, 400, "Bad Request", "User not found");
      }
      if (targetUser.id === request.user!.id) {
        return sendError(reply, 400, "Bad Request", "Cannot add yourself");
      }

      const existingCollaborator = access.collection.collaborators.find(
        (collaborator) => collaborator.userId === targetUser.id,
      );
      if (existingCollaborator) {
        return sendError(
          reply,
          400,
          "Bad Request",
          "User is already a collaborator",
        );
      }

      const [created] = await db
        .insert(schema.collectionCollaborator)
        .values({
          collectionId: id,
          userId: targetUser.id,
          role: body.role,
        })
        .returning();

      return {
        collaborator: serializeCollaborator({
          ...created,
          user: targetUser,
        }),
      };
    },
  );

  app.delete(
    "/:id/collaborators/:collaboratorId",
    {
      preHandler: [authenticate],
      schema: {
        tags: ["collections"],
        summary: "Remove collaborator",
        security: [{ cookieAuth: [] }],
      },
    },
    async (request, reply) => {
      const { id, collaboratorId } = request.params as {
        id: string;
        collaboratorId: string;
      };

      const access = await getCollectionAccess(id, request.user!.id);
      if (!access) {
        return sendError(reply, 404, "Not Found", "Collection not found");
      }
      if (!canManageCollaborators(access.role)) {
        return sendError(reply, 403, "Forbidden", "Permission denied");
      }

      const collaborator = access.collection.collaborators.find(
        (item) => item.id === collaboratorId,
      );
      if (!collaborator) {
        return sendError(reply, 404, "Not Found", "Collaborator not found");
      }
      if (collaborator.userId === access.collection.ownerId) {
        return sendError(reply, 400, "Bad Request", "Cannot remove owner");
      }

      await db
        .delete(schema.collectionCollaborator)
        .where(eq(schema.collectionCollaborator.id, collaboratorId));

      return {
        message: "Collaborator removed successfully",
      };
    },
  );

  app.get(
    "/:id/flashcards",
    {
      preHandler: [authenticate],
      schema: {
        tags: ["flashcards"],
        summary: "List flashcards for a collection",
        security: [{ cookieAuth: [] }],
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      const access = await getCollectionAccess(id, request.user!.id);
      if (!access) {
        return sendError(reply, 404, "Not Found", "Collection not found");
      }

      const flashcards = await getCollectionFlashcards(id);

      return {
        flashcards: flashcards.map(serializeFlashcard),
        role: access.role,
      };
    },
  );

  app.get(
    "/:id/flashcards/:flashcardId",
    {
      preHandler: [authenticate],
      schema: {
        tags: ["flashcards"],
        summary: "Get a single flashcard",
        security: [{ cookieAuth: [] }],
      },
    },
    async (request, reply) => {
      const { id, flashcardId } = request.params as {
        id: string;
        flashcardId: string;
      };

      const access = await getCollectionAccess(id, request.user!.id);
      if (!access) {
        return sendError(reply, 404, "Not Found", "Collection not found");
      }

      const flashcard = await db.query.flashcard.findFirst({
        where: and(
          eq(schema.flashcard.id, flashcardId),
          eq(schema.flashcard.collectionId, id),
        ),
      });

      if (!flashcard) {
        return sendError(reply, 404, "Not Found", "Flashcard not found");
      }

      return {
        flashcard: serializeFlashcard(flashcard),
        role: access.role,
      };
    },
  );

  app.post(
    "/:id/flashcards",
    {
      preHandler: [authenticate],
      schema: {
        tags: ["flashcards"],
        summary: "Create a flashcard in a collection",
        security: [{ cookieAuth: [] }],
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = createFlashcardBodySchema.parse(request.body);

      const access = await getCollectionAccess(id, request.user!.id);
      if (!access) {
        return sendError(reply, 404, "Not Found", "Collection not found");
      }
      if (!canEditCollection(access.role)) {
        return sendError(reply, 403, "Forbidden", "Permission denied");
      }

      const [created] = await db
        .insert(schema.flashcard)
        .values({
          question: body.question,
          answer: body.answer,
          type: body.type ?? "simple",
          collectionId: id,
          createdBy: request.user!.id,
          updatedAt: new Date(),
        })
        .returning();

      return reply.code(201).send({
        flashcard: serializeFlashcard(created),
      });
    },
  );

  app.put(
    "/:id/flashcards/:flashcardId",
    {
      preHandler: [authenticate],
      schema: {
        tags: ["flashcards"],
        summary: "Update a flashcard",
        security: [{ cookieAuth: [] }],
      },
    },
    async (request, reply) => {
      const { id, flashcardId } = request.params as {
        id: string;
        flashcardId: string;
      };
      const body = updateFlashcardBodySchema.parse(request.body);

      const access = await getCollectionAccess(id, request.user!.id);
      if (!access) {
        return sendError(reply, 404, "Not Found", "Collection not found");
      }
      if (!canEditCollection(access.role)) {
        return sendError(reply, 403, "Forbidden", "Permission denied");
      }

      const flashcard = await db.query.flashcard.findFirst({
        where: and(
          eq(schema.flashcard.id, flashcardId),
          eq(schema.flashcard.collectionId, id),
        ),
      });

      if (!flashcard) {
        return sendError(reply, 404, "Not Found", "Flashcard not found");
      }

      const [updated] = await db
        .update(schema.flashcard)
        .set({
          question: body.question ?? flashcard.question,
          answer: body.answer ?? flashcard.answer,
          type: body.type ?? flashcard.type,
          updatedAt: new Date(),
        })
        .where(eq(schema.flashcard.id, flashcardId))
        .returning();

      if (!updated) {
        return sendError(reply, 404, "Not Found", "Flashcard not found");
      }

      return {
        flashcard: serializeFlashcard(updated),
      };
    },
  );

  app.delete(
    "/:id/flashcards/:flashcardId",
    {
      preHandler: [authenticate],
      schema: {
        tags: ["flashcards"],
        summary: "Delete a flashcard",
        security: [{ cookieAuth: [] }],
      },
    },
    async (request, reply) => {
      const { id, flashcardId } = request.params as {
        id: string;
        flashcardId: string;
      };

      const access = await getCollectionAccess(id, request.user!.id);
      if (!access) {
        return sendError(reply, 404, "Not Found", "Collection not found");
      }
      if (!canEditCollection(access.role)) {
        return sendError(reply, 403, "Forbidden", "Permission denied");
      }

      const flashcard = await db.query.flashcard.findFirst({
        where: and(
          eq(schema.flashcard.id, flashcardId),
          eq(schema.flashcard.collectionId, id),
        ),
      });

      if (!flashcard) {
        return sendError(reply, 404, "Not Found", "Flashcard not found");
      }

      await db.delete(schema.flashcard).where(eq(schema.flashcard.id, flashcardId));

      return {
        message: "Flashcard deleted successfully",
      };
    },
  );

  app.post(
    "/:id/start-session",
    {
      preHandler: [authenticate],
      schema: {
        tags: ["reviews"],
        summary: "Start an SRS session for a collection",
        security: [{ cookieAuth: [] }],
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      const access = await getCollectionAccess(id, request.user!.id);
      if (!access) {
        return sendError(reply, 404, "Not Found", "Collection not found");
      }

      const flashcards = await getCollectionFlashcards(id);
      if (flashcards.length > 0) {
        await db
          .insert(schema.flashcardReview)
          .values(
            flashcards.map((flashcard) => ({
              flashcardId: flashcard.id,
              userId: request.user!.id,
              updatedAt: new Date(),
            })),
          )
          .onConflictDoNothing({
            target: [
              schema.flashcardReview.userId,
              schema.flashcardReview.flashcardId,
            ],
          });
      }

      return reply.send({
        message: "Learning session started",
      });
    },
  );

  app.get(
    "/:id/due",
    {
      preHandler: [authenticate],
      schema: {
        tags: ["reviews"],
        summary: "List due review items for a collection",
        security: [{ cookieAuth: [] }],
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const query = request.query as { limit?: string | number } | undefined;
      const limit =
        typeof query?.limit === "string"
          ? Number(query.limit)
          : query?.limit;

      const access = await getCollectionAccess(id, request.user!.id);
      if (!access) {
        return sendError(reply, 404, "Not Found", "Collection not found");
      }

      const reviewRows = await getReviewRowsForCollection(id, request.user!.id);
      const dueRows = reviewRows
        .filter((review) => review.dueAt.getTime() <= Date.now())
        .sort((left, right) => left.dueAt.getTime() - right.dueAt.getTime());

      return {
        reviews:
          limit && limit > 0
            ? dueRows.slice(0, limit).map(serializeReviewProgress)
            : dueRows.map(serializeReviewProgress),
      };
    },
  );

  app.get(
    "/:id/stats",
    {
      preHandler: [authenticate],
      schema: {
        tags: ["reviews"],
        summary: "Get SRS stats for a collection",
        security: [{ cookieAuth: [] }],
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      const access = await getCollectionAccess(id, request.user!.id);
      if (!access) {
        return sendError(reply, 404, "Not Found", "Collection not found");
      }

      const reviewRows = await getReviewRowsForCollection(id, request.user!.id);

      return {
        stats: buildCollectionStats(reviewRows),
      };
    },
  );

  app.get(
    "/:id/reviews",
    {
      preHandler: [authenticate],
      schema: {
        tags: ["reviews"],
        summary: "List all review progress rows for a collection",
        security: [{ cookieAuth: [] }],
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      const access = await getCollectionAccess(id, request.user!.id);
      if (!access) {
        return sendError(reply, 404, "Not Found", "Collection not found");
      }

      const reviewRows = await getReviewRowsForCollection(id, request.user!.id);

      return {
        reviews: reviewRows.map(serializeReviewProgress),
      };
    },
  );

  app.delete(
    "/:id/progress",
    {
      preHandler: [authenticate],
      schema: {
        tags: ["reviews"],
        summary: "Clear SRS progress for a collection",
        security: [{ cookieAuth: [] }],
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      const access = await getCollectionAccess(id, request.user!.id);
      if (!access) {
        return sendError(reply, 404, "Not Found", "Collection not found");
      }

      const flashcards = await getCollectionFlashcards(id);
      const flashcardIds = flashcards.map((flashcard) => flashcard.id);

      if (flashcardIds.length === 0) {
        return {
          deleted: 0,
          message: "Learning progress cleared successfully",
        };
      }

      const deleted = await db
        .delete(schema.flashcardReview)
        .where(
          and(
            eq(schema.flashcardReview.userId, request.user!.id),
            inArray(schema.flashcardReview.flashcardId, flashcardIds),
          ),
        )
        .returning({ id: schema.flashcardReview.id });

      return {
        deleted: deleted.length,
        message: "Learning progress cleared successfully",
      };
    },
  );
}
