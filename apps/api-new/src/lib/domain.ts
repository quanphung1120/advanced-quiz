import type {
  CollectionRole,
  CollaboratorRole,
} from "@advanced-quiz/contracts";
import { and, asc, db, desc, eq, ilike, inArray, schema } from "./db";

export function toIsoString(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}

export function serializeCollaborator(
  collaborator: typeof schema.collectionCollaborator.$inferSelect & {
    user?: typeof schema.user.$inferSelect | null;
  },
) {
  return {
    id: collaborator.id,
    collectionId: collaborator.collectionId,
    userId: collaborator.userId,
    email: collaborator.user?.email,
    role: collaborator.role as CollaboratorRole,
    createdAt: collaborator.createdAt.toISOString(),
  };
}

export function serializeCollection(
  collection: typeof schema.collection.$inferSelect & {
    collaborators?: Array<
      typeof schema.collectionCollaborator.$inferSelect & {
        user?: typeof schema.user.$inferSelect | null;
      }
    >;
  },
) {
  return {
    id: collection.id,
    name: collection.name,
    description: collection.description,
    isPublic: collection.isPublic,
    ownerId: collection.ownerId,
    createdAt: collection.createdAt.toISOString(),
    updatedAt: collection.updatedAt.toISOString(),
    collaborators: collection.collaborators?.map(serializeCollaborator),
  };
}

export function serializeFlashcard(
  flashcard: typeof schema.flashcard.$inferSelect,
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

export function serializeReviewProgress(
  review: typeof schema.flashcardReview.$inferSelect & {
    flashcard?: typeof schema.flashcard.$inferSelect;
  },
) {
  return {
    id: review.id,
    userId: review.userId,
    flashcardId: review.flashcardId,
    easeFactor: review.easeFactor,
    interval: review.interval,
    dueAt: review.dueAt.toISOString(),
    status: review.status,
    learningStep: review.learningStep,
    reviewCount: review.reviewCount,
    lapseCount: review.lapseCount,
    lastReviewedAt: toIsoString(review.lastReviewedAt),
    createdAt: review.createdAt.toISOString(),
    updatedAt: review.updatedAt.toISOString(),
    flashcard: review.flashcard ? serializeFlashcard(review.flashcard) : undefined,
  };
}

type CollectionAccessRecord = typeof schema.collection.$inferSelect & {
  collaborators: Array<
    typeof schema.collectionCollaborator.$inferSelect & {
      user: typeof schema.user.$inferSelect | null;
    }
  >;
};

export async function getCollectionAccess(
  collectionId: string,
  userId: string,
): Promise<{
  collection: CollectionAccessRecord;
  role: CollectionRole;
} | null> {
  const collection = await db.query.collection.findFirst({
    where: eq(schema.collection.id, collectionId),
    with: {
      collaborators: {
        with: {
          user: true,
        },
        orderBy: [asc(schema.collectionCollaborator.createdAt)],
      },
    },
  });

  if (!collection) {
    return null;
  }

  if (collection.ownerId === userId) {
    return { collection: collection as CollectionAccessRecord, role: "owner" };
  }

  const collaborator = collection.collaborators.find((item) => item.userId === userId);
  if (!collaborator) {
    return null;
  }

  return {
    collection: collection as CollectionAccessRecord,
    role: collaborator.role as CollectionRole,
  };
}

export function canEditCollection(role: CollectionRole) {
  return role === "owner" || role === "admin" || role === "editor";
}

export function canManageCollaborators(role: CollectionRole) {
  return role === "owner" || role === "admin";
}

export async function listCollectionsForUser(userId: string) {
  const [ownedCollections, sharedLinks] = await Promise.all([
    db.query.collection.findMany({
      where: eq(schema.collection.ownerId, userId),
      orderBy: [desc(schema.collection.updatedAt)],
    }),
    db.query.collectionCollaborator.findMany({
      where: eq(schema.collectionCollaborator.userId, userId),
      with: {
        collection: true,
      },
      orderBy: [desc(schema.collectionCollaborator.createdAt)],
    }),
  ]);

  const sharedCollectionIds = sharedLinks.map((item) => item.collection.id);
  const collaborators =
    sharedCollectionIds.length > 0
      ? await db.query.collectionCollaborator.findMany({
          where: inArray(
            schema.collectionCollaborator.collectionId,
            sharedCollectionIds,
          ),
          with: {
            user: true,
          },
        })
      : [];

  const collaboratorMap = new Map<
    string,
    Array<
      typeof schema.collectionCollaborator.$inferSelect & {
        user?: typeof schema.user.$inferSelect | null;
      }
    >
  >();

  for (const collaborator of collaborators) {
    const current = collaboratorMap.get(collaborator.collectionId) ?? [];
    current.push(collaborator);
    collaboratorMap.set(collaborator.collectionId, current);
  }

  return {
    ownedCollections: ownedCollections.map((collection) => serializeCollection(collection)),
    sharedCollections: sharedLinks.map((item) =>
      serializeCollection({
        ...item.collection,
        collaborators: collaboratorMap.get(item.collection.id),
      }),
    ),
  };
}

export async function searchUserEmails(query: string, currentUserId: string) {
  const users = await db.query.user.findMany({
    where: and(
      ilike(schema.user.email, `%${query}%`),
      ilike(schema.user.email, "%@%"),
    ),
    orderBy: [asc(schema.user.email)],
    limit: 10,
  });

  return users
    .filter((user) => user.id !== currentUserId)
    .map((user) => user.email);
}

export async function findUserByEmail(email: string) {
  return db.query.user.findFirst({
    where: eq(schema.user.email, email),
  });
}
