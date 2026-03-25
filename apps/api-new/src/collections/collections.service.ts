import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { CollectionRole, ReviewRating } from "@advanced-quiz/contracts";
import type { Prisma } from "@advanced-quiz/db";
import { DatabaseService } from "../database/database.service.js";
import {
  type CollectionAccessRecord,
  serializeCollection,
  serializeCollaborator,
  serializeFlashcard,
  serializeReviewProgress,
} from "../common/serialization.js";
import { buildCollectionStats, calculateNextReview } from "../lib/srs.js";

const COLLABORATOR_INCLUDE = {
  user: {
    select: {
      email: true,
    },
  },
} satisfies Prisma.CollectionCollaboratorInclude;

const COLLECTION_WITH_COLLABORATORS_INCLUDE = {
  collaborators: {
    include: COLLABORATOR_INCLUDE,
    orderBy: {
      createdAt: "asc",
    },
  },
} satisfies Prisma.CollectionInclude;

@Injectable()
export class CollectionsService {
  constructor(private readonly databaseService: DatabaseService) {}

  private get database() {
    return this.databaseService.database;
  }

  async listCollectionsForUser(userId: string) {
    const [ownedCollections, sharedLinks] = await Promise.all([
      this.database.collection.findMany({
        where: { ownerId: userId },
        orderBy: { updatedAt: "desc" },
        include: COLLECTION_WITH_COLLABORATORS_INCLUDE,
      }),
      this.database.collectionCollaborator.findMany({
        where: { userId },
        include: { collection: true },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const sharedCollectionIds = sharedLinks.map((item) => item.collection.id);
    const collaborators =
      sharedCollectionIds.length > 0
        ? await this.database.collectionCollaborator.findMany({
            where: {
              collectionId: {
                in: sharedCollectionIds,
              },
            },
            include: COLLABORATOR_INCLUDE,
            orderBy: { createdAt: "asc" },
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
    const collection = await this.database.collection.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        isPublic: data.isPublic ?? false,
        ownerId: userId,
      },
      include: COLLECTION_WITH_COLLABORATORS_INCLUDE,
    });

    return serializeCollection(collection);
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

    const updated = await this.database.collection.update({
      where: { id: collectionId },
      data: {
        name: data.name ?? access.collection.name,
        description:
          data.description !== undefined
            ? data.description
            : access.collection.description,
        isPublic:
          data.isPublic !== undefined
            ? data.isPublic
            : access.collection.isPublic,
      },
      include: COLLECTION_WITH_COLLABORATORS_INCLUDE,
    });

    return serializeCollection(updated);
  }

  async deleteCollection(collectionId: string, userId: string) {
    const access = await this.getCollectionAccess(collectionId, userId);

    if (access.role !== "owner") {
      throw new ForbiddenException("Permission denied");
    }

    await this.database.collection.delete({
      where: { id: collectionId },
    });

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

    const targetUser = await this.database.user.findUnique({
      where: { email: data.email },
      select: {
        id: true,
        email: true,
      },
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

    const collaborator = await this.database.collectionCollaborator.create({
      data: {
        collectionId,
        userId: targetUser.id,
        role: data.role,
      },
      include: COLLABORATOR_INCLUDE,
    });

    return {
      collaborator: serializeCollaborator(collaborator),
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

    await this.database.collectionCollaborator.delete({
      where: { id: collaboratorId },
    });

    return {
      message: "Collaborator removed successfully",
    };
  }

  async listFlashcards(collectionId: string, userId: string) {
    const access = await this.getCollectionAccess(collectionId, userId);
    const flashcards = await this.database.flashcard.findMany({
      where: { collectionId },
      orderBy: { createdAt: "asc" },
    });

    return {
      flashcards: flashcards.map(serializeFlashcard),
      role: access.role,
    };
  }

  async getFlashcard(
    collectionId: string,
    flashcardId: string,
    userId: string,
  ) {
    const access = await this.getCollectionAccess(collectionId, userId);
    const flashcard = await this.database.flashcard.findFirst({
      where: {
        id: flashcardId,
        collectionId,
      },
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

    const flashcard = await this.database.flashcard.create({
      data: {
        question: data.question,
        answer: data.answer,
        type: data.type ?? "simple",
        collectionId,
        createdBy: userId,
      },
    });

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

    const flashcard = await this.database.flashcard.findFirst({
      where: {
        id: flashcardId,
        collectionId,
      },
    });

    if (!flashcard) {
      throw new NotFoundException("Flashcard not found");
    }

    const updated = await this.database.flashcard.update({
      where: { id: flashcardId },
      data: {
        question: data.question ?? flashcard.question,
        answer: data.answer ?? flashcard.answer,
        type: data.type ?? flashcard.type,
      },
    });

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

    const flashcard = await this.database.flashcard.findFirst({
      where: {
        id: flashcardId,
        collectionId,
      },
    });

    if (!flashcard) {
      throw new NotFoundException("Flashcard not found");
    }

    await this.database.flashcard.delete({
      where: { id: flashcardId },
    });

    return {
      message: "Flashcard deleted successfully",
    };
  }

  async startSession(collectionId: string, userId: string) {
    await this.getCollectionAccess(collectionId, userId);

    const flashcards = await this.database.flashcard.findMany({
      where: { collectionId },
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });

    if (flashcards.length > 0) {
      await this.database.flashcardReview.createMany({
        data: flashcards.map((flashcard) => ({
          flashcardId: flashcard.id,
          userId,
        })),
        skipDuplicates: true,
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

    const flashcards = await this.database.flashcard.findMany({
      where: { collectionId },
      select: { id: true },
    });
    const flashcardIds = flashcards.map((flashcard) => flashcard.id);

    if (flashcardIds.length === 0) {
      return {
        deleted: 0,
        message: "Learning progress cleared successfully",
      };
    }

    const deleted = await this.database.flashcardReview.deleteMany({
      where: {
        userId,
        flashcardId: {
          in: flashcardIds,
        },
      },
    });

    return {
      deleted: deleted.count,
      message: "Learning progress cleared successfully",
    };
  }

  async submitReview(
    flashcardId: string,
    userId: string,
    rating: ReviewRating,
  ) {
    const flashcard = await this.database.flashcard.findUnique({
      where: { id: flashcardId },
    });

    if (!flashcard) {
      throw new NotFoundException("Flashcard not found");
    }

    await this.getCollectionAccess(flashcard.collectionId, userId);

    let review = await this.database.flashcardReview.findFirst({
      where: {
        userId,
        flashcardId,
      },
    });

    if (!review) {
      review = await this.database.flashcardReview.create({
        data: {
          flashcardId,
          userId,
        },
      });
    }

    const next = calculateNextReview(review, rating);

    const updated = await this.database.flashcardReview.update({
      where: { id: review.id },
      data: next,
      include: { flashcard: true },
    });

    return {
      review: serializeReviewProgress(updated),
    };
  }

  private async getCollectionAccess(
    collectionId: string,
    userId: string,
  ): Promise<{ collection: CollectionAccessRecord; role: CollectionRole }> {
    const collection = await this.database.collection.findUnique({
      where: { id: collectionId },
      include: COLLECTION_WITH_COLLABORATORS_INCLUDE,
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
    return this.database.flashcardReview.findMany({
      where: {
        userId,
        flashcard: {
          collectionId,
        },
      },
      include: {
        flashcard: true,
      },
      orderBy: {
        dueAt: "asc",
      },
    });
  }

  private canEditCollection(role: CollectionRole) {
    return role === "owner" || role === "admin" || role === "editor";
  }

  private canManageCollaborators(role: CollectionRole) {
    return role === "owner" || role === "admin";
  }
}
