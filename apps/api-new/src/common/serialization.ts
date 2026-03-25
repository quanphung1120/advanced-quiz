import type { CollaboratorRole, ReviewStatus } from "@advanced-quiz/contracts";
import type { Prisma } from "@advanced-quiz/db";

export function toIsoString(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}

type CollaboratorWithUser = Prisma.CollectionCollaboratorGetPayload<{
  include: {
    user: {
      select: {
        email: true;
      };
    };
  };
}>;

type CollectionWithCollaborators = Prisma.CollectionGetPayload<{
  include: {
    collaborators: {
      include: {
        user: {
          select: {
            email: true;
          };
        };
      };
    };
  };
}>;

type ReviewWithFlashcard = Prisma.FlashcardReviewGetPayload<{
  include: {
    flashcard: true;
  };
}>;

export function serializeCollaborator(collaborator: CollaboratorWithUser) {
  return {
    id: collaborator.id,
    collectionId: collaborator.collectionId,
    userId: collaborator.userId,
    email: collaborator.user.email,
    role: collaborator.role as CollaboratorRole,
    createdAt: collaborator.createdAt.toISOString(),
  };
}

export function serializeCollection(collection: CollectionWithCollaborators) {
  return {
    id: collection.id,
    name: collection.name,
    description: collection.description,
    isPublic: collection.isPublic,
    ownerId: collection.ownerId,
    createdAt: collection.createdAt.toISOString(),
    updatedAt: collection.updatedAt.toISOString(),
    collaborators: collection.collaborators.map(serializeCollaborator),
  };
}

export function serializeFlashcard(
  flashcard: Prisma.FlashcardGetPayload<object>,
) {
  return {
    id: flashcard.id,
    question: flashcard.question,
    answer: flashcard.answer,
    type: flashcard.type,
    collectionId: flashcard.collectionId,
    createdBy: flashcard.createdBy,
    createdAt: flashcard.createdAt.toISOString(),
    updatedAt: flashcard.updatedAt.toISOString(),
  };
}

export function serializeReviewProgress(review: ReviewWithFlashcard) {
  return {
    id: review.id,
    userId: review.userId,
    flashcardId: review.flashcardId,
    easeFactor: review.easeFactor,
    interval: review.interval,
    dueAt: review.dueAt.toISOString(),
    status: review.status as ReviewStatus,
    learningStep: review.learningStep,
    reviewCount: review.reviewCount,
    lapseCount: review.lapseCount,
    lastReviewedAt: toIsoString(review.lastReviewedAt),
    createdAt: review.createdAt.toISOString(),
    updatedAt: review.updatedAt.toISOString(),
    flashcard: serializeFlashcard(review.flashcard),
  };
}

export type CollectionAccessRecord = CollectionWithCollaborators;
