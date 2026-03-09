import { relations } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import {
  boolean,
  doublePrecision,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const createUuid = () => randomUUID();

export const user = pgTable(
  "user",
  {
    id: text("id").primaryKey().$defaultFn(createUuid),
    name: text("name").notNull(),
    email: text("email").notNull(),
    password: text("password").notNull(),
    emailVerified: boolean("email_verified").notNull().default(false),
    emailVerifiedAt: timestamp("email_verified_at", {
      mode: "date",
      precision: 3,
    }),
    passwordChangedAt: timestamp("password_changed_at", {
      mode: "date",
      precision: 3,
    }),
    createdAt: timestamp("created_at", { mode: "date", precision: 3 })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date", precision: 3 })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex("user_email_key").on(table.email)],
);

export const refreshToken = pgTable(
  "refresh_token",
  {
    id: text("id").primaryKey().$defaultFn(createUuid),
    token: text("token").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    expiresAt: timestamp("expires_at", {
      mode: "date",
      precision: 3,
    }).notNull(),
    createdAt: timestamp("created_at", { mode: "date", precision: 3 })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("refresh_token_token_key").on(table.token),
    index("refresh_token_user_id_idx").on(table.userId),
  ],
);

export const emailOtp = pgTable(
  "email_otp",
  {
    id: text("id").primaryKey().$defaultFn(createUuid),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    purpose: text("purpose").notNull(),
    codeHash: text("code_hash").notNull(),
    expiresAt: timestamp("expires_at", {
      mode: "date",
      precision: 3,
    }).notNull(),
    lastSentAt: timestamp("last_sent_at", { mode: "date", precision: 3 })
      .notNull()
      .defaultNow(),
    attempts: integer("attempts").notNull().default(0),
    createdAt: timestamp("created_at", { mode: "date", precision: 3 })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("email_otp_user_id_purpose_idx").on(table.userId, table.purpose),
  ],
);

export const passwordResetToken = pgTable(
  "password_reset_token",
  {
    id: text("id").primaryKey().$defaultFn(createUuid),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", {
      mode: "date",
      precision: 3,
    }).notNull(),
    usedAt: timestamp("used_at", { mode: "date", precision: 3 }),
    createdAt: timestamp("created_at", { mode: "date", precision: 3 })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("password_reset_token_token_hash_key").on(table.tokenHash),
    index("password_reset_token_user_id_expires_at_idx").on(
      table.userId,
      table.expiresAt,
    ),
  ],
);

export const collection = pgTable(
  "collection",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    description: text("description"),
    isPublic: boolean("is_public").notNull().default(false),
    ownerId: text("owner_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    createdAt: timestamp("created_at", { mode: "date", precision: 3 })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date", precision: 3 })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("collection_owner_id_idx").on(table.ownerId)],
);

export const collectionCollaborator = pgTable(
  "collection_collaborator",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    collectionId: uuid("collection_id")
      .notNull()
      .references(() => collection.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    role: text("role").notNull().default("viewer"),
    createdAt: timestamp("created_at", { mode: "date", precision: 3 })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("collection_collaborator_unique_idx").on(
      table.collectionId,
      table.userId,
    ),
    index("collection_collaborator_user_id_idx").on(table.userId),
  ],
);

export const flashcard = pgTable(
  "flashcard",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    question: text("question").notNull(),
    answer: text("answer").notNull(),
    type: text("type").notNull().default("simple"),
    collectionId: uuid("collection_id")
      .notNull()
      .references(() => collection.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    createdAt: timestamp("created_at", { mode: "date", precision: 3 })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date", precision: 3 })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("flashcard_collection_id_idx").on(table.collectionId)],
);

export const flashcardReview = pgTable(
  "flashcard_review",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    flashcardId: uuid("flashcard_id")
      .notNull()
      .references(() => flashcard.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    easeFactor: doublePrecision("ease_factor").notNull().default(2.5),
    interval: integer("interval").notNull().default(0),
    dueAt: timestamp("due_at", { mode: "date", precision: 3 })
      .notNull()
      .defaultNow(),
    status: text("status").notNull().default("new"),
    learningStep: integer("learning_step").notNull().default(0),
    reviewCount: integer("review_count").notNull().default(0),
    lapseCount: integer("lapse_count").notNull().default(0),
    lastReviewedAt: timestamp("last_reviewed_at", {
      mode: "date",
      precision: 3,
    }),
    createdAt: timestamp("created_at", { mode: "date", precision: 3 })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date", precision: 3 })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("flashcard_review_user_card_idx").on(
      table.userId,
      table.flashcardId,
    ),
    index("flashcard_review_flashcard_id_idx").on(table.flashcardId),
    index("flashcard_review_due_idx").on(table.userId, table.dueAt),
    index("flashcard_review_status_idx").on(table.userId, table.status),
  ],
);

export const userRelations = relations(user, ({ many }) => ({
  refreshTokens: many(refreshToken),
  emailOtps: many(emailOtp),
  passwordResetTokens: many(passwordResetToken),
  ownedCollections: many(collection),
  collaborations: many(collectionCollaborator),
  createdFlashcards: many(flashcard),
  reviews: many(flashcardReview),
}));

export const refreshTokenRelations = relations(refreshToken, ({ one }) => ({
  user: one(user, {
    fields: [refreshToken.userId],
    references: [user.id],
  }),
}));

export const emailOtpRelations = relations(emailOtp, ({ one }) => ({
  user: one(user, {
    fields: [emailOtp.userId],
    references: [user.id],
  }),
}));

export const passwordResetTokenRelations = relations(
  passwordResetToken,
  ({ one }) => ({
    user: one(user, {
      fields: [passwordResetToken.userId],
      references: [user.id],
    }),
  }),
);

export const collectionRelations = relations(collection, ({ one, many }) => ({
  owner: one(user, {
    fields: [collection.ownerId],
    references: [user.id],
  }),
  collaborators: many(collectionCollaborator),
  flashcards: many(flashcard),
}));

export const collectionCollaboratorRelations = relations(
  collectionCollaborator,
  ({ one }) => ({
    collection: one(collection, {
      fields: [collectionCollaborator.collectionId],
      references: [collection.id],
    }),
    user: one(user, {
      fields: [collectionCollaborator.userId],
      references: [user.id],
    }),
  }),
);

export const flashcardRelations = relations(flashcard, ({ one, many }) => ({
  collection: one(collection, {
    fields: [flashcard.collectionId],
    references: [collection.id],
  }),
  creator: one(user, {
    fields: [flashcard.createdBy],
    references: [user.id],
  }),
  reviews: many(flashcardReview),
}));

export const flashcardReviewRelations = relations(
  flashcardReview,
  ({ one }) => ({
    flashcard: one(flashcard, {
      fields: [flashcardReview.flashcardId],
      references: [flashcard.id],
    }),
    user: one(user, {
      fields: [flashcardReview.userId],
      references: [user.id],
    }),
  }),
);

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;

export type RefreshToken = typeof refreshToken.$inferSelect;
export type NewRefreshToken = typeof refreshToken.$inferInsert;

export type EmailOtp = typeof emailOtp.$inferSelect;
export type NewEmailOtp = typeof emailOtp.$inferInsert;

export type PasswordResetToken = typeof passwordResetToken.$inferSelect;
export type NewPasswordResetToken = typeof passwordResetToken.$inferInsert;

export type Collection = typeof collection.$inferSelect;
export type NewCollection = typeof collection.$inferInsert;

export type CollectionCollaborator = typeof collectionCollaborator.$inferSelect;
export type NewCollectionCollaborator =
  typeof collectionCollaborator.$inferInsert;

export type Flashcard = typeof flashcard.$inferSelect;
export type NewFlashcard = typeof flashcard.$inferInsert;

export type FlashcardReview = typeof flashcardReview.$inferSelect;
export type NewFlashcardReview = typeof flashcardReview.$inferInsert;

// Plural aliases keep call sites readable in query code.
export const users = user;
export const refreshTokens = refreshToken;
export const emailOtps = emailOtp;
export const passwordResetTokens = passwordResetToken;
export const collections = collection;
export const collectionCollaborators = collectionCollaborator;
export const flashcards = flashcard;
export const flashcardReviews = flashcardReview;
