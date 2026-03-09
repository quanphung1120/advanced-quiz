import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { CollectionRole, ReviewRating } from "@advanced-quiz/contracts";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import {
  collectionCollaborators,
  collections,
  type DatabaseClient,
  flashcardReviews,
  flashcards,
  users,
} from "@advanced-quiz/db";
import { DATABASE } from "../database/database.service";
import { buildCollectionStats, calculateNextReview } from "../lib/srs";
import {
  type CollectionAccessRecord,
  serializeCollection,
  serializeCollaborator,
  serializeFlashcard,
  serializeReviewProgress,
} from "../common/serialization";

@Injectable()
export class CollectionsService {
  constructor(@Inject(DATABASE) private readonly database: DatabaseClient) {}

  async listCollectionsForUser(userId: string) {
    const [ownedCollections, sharedLinks] = await Promise.all([
      this.database.query.collections.findMany({
        where: eq(collections.ownerId, userId),
        orderBy: (table, { desc }) => [desc(table.updatedAt)],
        with: {
          collaborators: {
            with: { user: true },
            orderBy: (table, { asc }) => [asc(table.createdAt)],
          },
        },
      }),
      this.database.query.collectionCollaborators.findMany({
        where: eq(collectionCollaborators.userId, userId),
        with: { collection: true },
        orderBy: (table, { desc }) => [desc(table.createdAt)],
      }),
    ]);

    const sharedCollectionIds = sharedLinks.map((item) => item.collection.id);
    const collaborators =
      sharedCollectionIds.length > 0
        ? await this.database.query.collectionCollaborators.findMany({
            where: inArray(
              collectionCollaborators.collectionId,
              sharedCollectionIds,
            ),
            with: { user: true },
            orderBy: (table, { asc }) => [asc(table.createdAt)],
          })
        : [];

    const collaboratorMap = new Map<string, typeof collaborators>();

    for (const collaborator of collaborators) {
      const current = collaboratorMap.get(collaborator.collectionId) ?? [];
      current.push(collaborator);
      collaboratorMap.set(collaborator.collectionId, current);
    }

    return {
      ownedCollections: ownedCollections.map(serializeCollection),
      sharedCollections: sharedLinks.map((item) =>
        serializeCollection({
          ...item.collection,
          collaborators: collaboratorMap.get(item.collection.id) ?? [],
        }),
      ),
    };
  }

  async createCollection(
    userId: string,
    data: { name: string; description?: string; isPublic?: boolean },
  ) {
    const [collection] = await this.database
      .insert(collections)
      .values({
        name: data.name,
        description: data.description ?? null,
        isPublic: data.isPublic ?? false,
        ownerId: userId,
      })
      .returning();

    if (!collection) {
      throw new BadRequestException("Unable to create collection");
    }

    return serializeCollection({
      ...collection,
      collaborators: [],
    });
  }

  async getCollection(collectionId: string, userId: string) {
    const access = await this.getCollectionAccess(collectionId, userId);
    return {
      collection: serializeCollection(access.collection),
      role: access.role,
    };
  }

  async updateCollection(
    collectionId: string,
    userId: string,
    data: { name?: string; description?: string; isPublic?: boolean },
  ) {
    const access = await this.getCollectionAccess(collectionId, userId);

    if (!this.canEditCollection(access.role)) {
      throw new ForbiddenException("Permission denied");
    }

    const now = new Date();

    await this.database
      .update(collections)
      .set({
        name: data.name ?? access.collection.name,
        description:
          data.description !== undefined
            ? data.description
            : access.collection.description,
        isPublic:
          data.isPublic !== undefined
            ? data.isPublic
            : access.collection.isPublic,
        updatedAt: now,
      })
      .where(eq(collections.id, collectionId));

    const refreshedAccess = await this.getCollectionAccess(
      collectionId,
      userId,
    );

    return serializeCollection(refreshedAccess.collection);
  }

  async deleteCollection(collectionId: string, userId: string) {
    const access = await this.getCollectionAccess(collectionId, userId);

    if (access.role !== "owner") {
      throw new ForbiddenException("Permission denied");
    }

    await this.database
      .delete(collections)
      .where(eq(collections.id, collectionId));

    return { message: "Collection deleted successfully" };
  }

  async addCollaborator(
    collectionId: string,
    userId: string,
    data: { email: string; role: string },
  ) {
    const access = await this.getCollectionAccess(collectionId, userId);

    if (!this.canManageCollaborators(access.role)) {
      throw new ForbiddenException("Permission denied");
    }

    const targetUser = await this.database.query.users.findFirst({
      where: eq(users.email, data.email),
    });

    if (!targetUser) {
      throw new BadRequestException("No account found for that email address");
    }

    if (targetUser.id === userId) {
      throw new BadRequestException("Cannot add yourself");
    }

    const existingCollaborator = access.collection.collaborators.find(
      (collaborator) => collaborator.userId === targetUser.id,
    );

    if (existingCollaborator) {
      throw new BadRequestException("User is already a collaborator");
    }

    const [collaborator] = await this.database
      .insert(collectionCollaborators)
      .values({
        collectionId,
        userId: targetUser.id,
        role: data.role,
      })
      .returning();

    if (!collaborator) {
      throw new BadRequestException("Unable to add collaborator");
    }

    return {
      collaborator: serializeCollaborator({
        ...collaborator,
        user: targetUser,
      }),
    };
  }

  async removeCollaborator(
    collectionId: string,
    collaboratorId: string,
    userId: string,
  ) {
    const access = await this.getCollectionAccess(collectionId, userId);

    if (!this.canManageCollaborators(access.role)) {
      throw new ForbiddenException("Permission denied");
    }

    const collaborator = access.collection.collaborators.find(
      (item) => item.id === collaboratorId,
    );

    if (!collaborator) {
      throw new NotFoundException("Collaborator not found");
    }

    if (collaborator.userId === access.collection.ownerId) {
      throw new BadRequestException("Cannot remove owner");
    }

    await this.database
      .delete(collectionCollaborators)
      .where(eq(collectionCollaborators.id, collaboratorId));

    return {
      message: "Collaborator removed successfully",
    };
  }

  async listFlashcards(collectionId: string, userId: string) {
    const access = await this.getCollectionAccess(collectionId, userId);
    const flashcardsList = await this.database.query.flashcards.findMany({
      where: eq(flashcards.collectionId, collectionId),
      orderBy: (table, { asc }) => [asc(table.createdAt)],
    });

    return {
      flashcards: flashcardsList.map(serializeFlashcard),
      role: access.role,
    };
  }

  async getFlashcard(
    collectionId: string,
    flashcardId: string,
    userId: string,
  ) {
    const access = await this.getCollectionAccess(collectionId, userId);
    const flashcard = await this.database.query.flashcards.findFirst({
      where: and(
        eq(flashcards.id, flashcardId),
        eq(flashcards.collectionId, collectionId),
      ),
    });

    if (!flashcard) {
      throw new NotFoundException("Flashcard not found");
    }

    return {
      flashcard: serializeFlashcard(flashcard),
      role: access.role,
    };
  }

  async createFlashcard(
    collectionId: string,
    userId: string,
    data: { question: string; answer: string; type?: string },
  ) {
    const access = await this.getCollectionAccess(collectionId, userId);

    if (!this.canEditCollection(access.role)) {
      throw new ForbiddenException("Permission denied");
    }

    const [flashcard] = await this.database
      .insert(flashcards)
      .values({
        question: data.question,
        answer: data.answer,
        type: data.type ?? "simple",
        collectionId,
        createdBy: userId,
      })
      .returning();

    if (!flashcard) {
      throw new BadRequestException("Unable to create flashcard");
    }

    return {
      flashcard: serializeFlashcard(flashcard),
    };
  }

  async updateFlashcard(
    collectionId: string,
    flashcardId: string,
    userId: string,
    data: { question?: string; answer?: string; type?: string },
  ) {
    const access = await this.getCollectionAccess(collectionId, userId);

    if (!this.canEditCollection(access.role)) {
      throw new ForbiddenException("Permission denied");
    }

    const flashcard = await this.database.query.flashcards.findFirst({
      where: and(
        eq(flashcards.id, flashcardId),
        eq(flashcards.collectionId, collectionId),
      ),
    });

    if (!flashcard) {
      throw new NotFoundException("Flashcard not found");
    }

    const [updated] = await this.database
      .update(flashcards)
      .set({
        question: data.question ?? flashcard.question,
        answer: data.answer ?? flashcard.answer,
        type: data.type ?? flashcard.type,
        updatedAt: new Date(),
      })
      .where(eq(flashcards.id, flashcardId))
      .returning();

    if (!updated) {
      throw new NotFoundException("Flashcard not found");
    }

    return {
      flashcard: serializeFlashcard(updated),
    };
  }

  async deleteFlashcard(
    collectionId: string,
    flashcardId: string,
    userId: string,
  ) {
    const access = await this.getCollectionAccess(collectionId, userId);

    if (!this.canEditCollection(access.role)) {
      throw new ForbiddenException("Permission denied");
    }

    const flashcard = await this.database.query.flashcards.findFirst({
      where: and(
        eq(flashcards.id, flashcardId),
        eq(flashcards.collectionId, collectionId),
      ),
    });

    if (!flashcard) {
      throw new NotFoundException("Flashcard not found");
    }

    await this.database
      .delete(flashcards)
      .where(eq(flashcards.id, flashcardId));

    return {
      message: "Flashcard deleted successfully",
    };
  }

  async startSession(collectionId: string, userId: string) {
    await this.getCollectionAccess(collectionId, userId);

    const flashcardsList = await this.database.query.flashcards.findMany({
      where: eq(flashcards.collectionId, collectionId),
      orderBy: (table, { asc }) => [asc(table.createdAt)],
      columns: { id: true },
    });

    if (flashcardsList.length > 0) {
      await this.database
        .insert(flashcardReviews)
        .values(
          flashcardsList.map((flashcard) => ({
            flashcardId: flashcard.id,
            userId,
          })),
        )
        .onConflictDoNothing({
          target: [flashcardReviews.userId, flashcardReviews.flashcardId],
        });
    }

    return {
      message: "Learning session started",
    };
  }

  async getDueReviews(collectionId: string, userId: string, limit?: number) {
    await this.getCollectionAccess(collectionId, userId);

    const reviews = await this.getReviewRowsForCollection(collectionId, userId);
    const dueRows = reviews
      .filter((review) => review.dueAt.getTime() <= Date.now())
      .sort((left, right) => left.dueAt.getTime() - right.dueAt.getTime());

    return {
      reviews:
        limit && limit > 0
          ? dueRows.slice(0, limit).map(serializeReviewProgress)
          : dueRows.map(serializeReviewProgress),
    };
  }

  async getCollectionStats(collectionId: string, userId: string) {
    await this.getCollectionAccess(collectionId, userId);
    const reviews = await this.getReviewRowsForCollection(collectionId, userId);

    return {
      stats: buildCollectionStats(reviews),
    };
  }

  async getReviews(collectionId: string, userId: string) {
    await this.getCollectionAccess(collectionId, userId);
    const reviews = await this.getReviewRowsForCollection(collectionId, userId);

    return {
      reviews: reviews.map(serializeReviewProgress),
    };
  }

  async clearProgress(collectionId: string, userId: string) {
    await this.getCollectionAccess(collectionId, userId);

    const flashcardsList = await this.database.query.flashcards.findMany({
      where: eq(flashcards.collectionId, collectionId),
      columns: { id: true },
    });
    const flashcardIds = flashcardsList.map((flashcard) => flashcard.id);

    if (flashcardIds.length === 0) {
      return {
        deleted: 0,
        message: "Learning progress cleared successfully",
      };
    }

    const deleted = await this.database
      .delete(flashcardReviews)
      .where(
        and(
          eq(flashcardReviews.userId, userId),
          inArray(flashcardReviews.flashcardId, flashcardIds),
        ),
      )
      .returning({ id: flashcardReviews.id });

    return {
      deleted: deleted.length,
      message: "Learning progress cleared successfully",
    };
  }

  async submitReview(
    flashcardId: string,
    userId: string,
    rating: ReviewRating,
  ) {
    const flashcard = await this.database.query.flashcards.findFirst({
      where: eq(flashcards.id, flashcardId),
    });

    if (!flashcard) {
      throw new NotFoundException("Flashcard not found");
    }

    await this.getCollectionAccess(flashcard.collectionId, userId);

    let review = await this.database.query.flashcardReviews.findFirst({
      where: and(
        eq(flashcardReviews.userId, userId),
        eq(flashcardReviews.flashcardId, flashcardId),
      ),
    });

    if (!review) {
      const [created] = await this.database
        .insert(flashcardReviews)
        .values({
          flashcardId,
          userId,
        })
        .returning();

      if (!created) {
        throw new BadRequestException("Unable to create review progress");
      }

      review = created;
    }

    const next = calculateNextReview(review, rating);

    await this.database
      .update(flashcardReviews)
      .set(next)
      .where(eq(flashcardReviews.id, review.id));

    const updated = await this.database.query.flashcardReviews.findFirst({
      where: eq(flashcardReviews.id, review.id),
      with: { flashcard: true },
    });

    if (!updated) {
      throw new NotFoundException("Review not found");
    }

    return {
      review: serializeReviewProgress(updated),
    };
  }

  private async getCollectionAccess(
    collectionId: string,
    userId: string,
  ): Promise<{ collection: CollectionAccessRecord; role: CollectionRole }> {
    const collection = await this.database.query.collections.findFirst({
      where: eq(collections.id, collectionId),
      with: {
        collaborators: {
          with: { user: true },
          orderBy: (table, { asc }) => [asc(table.createdAt)],
        },
      },
    });

    if (!collection) {
      throw new NotFoundException("Collection not found");
    }

    if (collection.ownerId === userId) {
      return { collection, role: "owner" };
    }

    const collaborator = collection.collaborators.find(
      (item) => item.userId === userId,
    );

    if (!collaborator) {
      throw new NotFoundException("Collection not found");
    }

    return {
      collection,
      role: collaborator.role as CollectionRole,
    };
  }

  private async getReviewRowsForCollection(
    collectionId: string,
    userId: string,
  ) {
    const rows = await this.database
      .select({
        review: flashcardReviews,
        flashcard: flashcards,
      })
      .from(flashcardReviews)
      .innerJoin(flashcards, eq(flashcardReviews.flashcardId, flashcards.id))
      .where(
        and(
          eq(flashcardReviews.userId, userId),
          eq(flashcards.collectionId, collectionId),
        ),
      )
      .orderBy(asc(flashcardReviews.dueAt));

    return rows.map((row) => ({
      ...row.review,
      flashcard: row.flashcard,
    }));
  }

  private canEditCollection(role: CollectionRole) {
    return role === "owner" || role === "admin" || role === "editor";
  }

  private canManageCollaborators(role: CollectionRole) {
    return role === "owner" || role === "admin";
  }
}
