import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  doublePrecision,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const collection = pgTable(
  "collection",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    description: text("description"),
    isPublic: boolean("is_public").notNull().default(false),
    ownerId: text("owner_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    ownerIdx: index("collection_owner_id_idx").on(table.ownerId),
  }),
);

export const collectionCollaborator = pgTable(
  "collection_collaborator",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    collectionId: uuid("collection_id")
      .notNull()
      .references(() => collection.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("viewer"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    uniqueMembership: uniqueIndex("collection_collaborator_unique_idx").on(
      table.collectionId,
      table.userId,
    ),
  }),
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
      .references(() => collection.id, { onDelete: "cascade" }),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    collectionIdx: index("flashcard_collection_id_idx").on(table.collectionId),
  }),
);

export const flashcardReview = pgTable(
  "flashcard_review",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    flashcardId: uuid("flashcard_id")
      .notNull()
      .references(() => flashcard.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    easeFactor: doublePrecision("ease_factor").notNull().default(2.5),
    interval: integer("interval").notNull().default(0),
    dueAt: timestamp("due_at").notNull().defaultNow(),
    status: text("status").notNull().default("new"),
    learningStep: integer("learning_step").notNull().default(0),
    reviewCount: integer("review_count").notNull().default(0),
    lapseCount: integer("lapse_count").notNull().default(0),
    lastReviewedAt: timestamp("last_reviewed_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    uniqueUserCard: uniqueIndex("flashcard_review_user_card_idx").on(
      table.userId,
      table.flashcardId,
    ),
    dueIdx: index("flashcard_review_due_idx").on(table.userId, table.dueAt),
    statusIdx: index("flashcard_review_status_idx").on(
      table.userId,
      table.status,
    ),
  }),
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  ownedCollections: many(collection),
  collaborations: many(collectionCollaborator),
  createdFlashcards: many(flashcard),
  reviews: many(flashcardReview),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

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
