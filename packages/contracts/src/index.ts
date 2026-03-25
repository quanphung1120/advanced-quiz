import { z } from "zod";

export const collaboratorRoleSchema = z.enum(["viewer", "editor", "admin"]);
export type CollaboratorRole = z.infer<typeof collaboratorRoleSchema>;

export const collectionRoleSchema = z.enum([
  "owner",
  "viewer",
  "editor",
  "admin",
]);
export type CollectionRole = z.infer<typeof collectionRoleSchema>;

export const flashcardTypeSchema = z
  .enum(["simple", "multiple_choice", "true_false"])
  .default("simple");
export type FlashcardType = z.infer<typeof flashcardTypeSchema>;

export const reviewRatingSchema = z.number().int().min(0).max(3);
export type ReviewRating = z.infer<typeof reviewRatingSchema>;

export const reviewStatusSchema = z.enum([
  "new",
  "learning",
  "review",
  "relearning",
]);
export type ReviewStatus = z.infer<typeof reviewStatusSchema>;

export const sessionUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  emailVerified: z.boolean(),
  image: z.string().nullable().optional(),
});
export type SessionUser = z.infer<typeof sessionUserSchema>;

export const uiMessageRoleSchema = z.enum(["system", "user", "assistant"]);
export type UIMessageRole = z.infer<typeof uiMessageRoleSchema>;

export const uiMessageSchema = z
  .object({
    id: z.string(),
    role: uiMessageRoleSchema,
    parts: z.array(z.unknown()),
    metadata: z.unknown().optional(),
  })
  .passthrough();
export type PersistedUIMessage = z.infer<typeof uiMessageSchema>;

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(64, "Password must be 64 characters or fewer")
  .regex(/[A-Z]/, "Password must include an uppercase letter")
  .regex(/[^A-Za-z0-9]/, "Password must include a special character");
export type Password = z.infer<typeof passwordSchema>;

export const otpCodeSchema = z
  .string()
  .regex(/^\d{6}$/, "Verification code must be 6 digits");
export type OtpCode = z.infer<typeof otpCodeSchema>;

export const collectionCollaboratorSchema = z.object({
  id: z.string().uuid(),
  collectionId: z.string().uuid(),
  userId: z.string(),
  email: z.string().email().optional(),
  role: collaboratorRoleSchema,
  createdAt: z.string(),
});
export type CollectionCollaborator = z.infer<
  typeof collectionCollaboratorSchema
>;

export const collectionSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  isPublic: z.boolean(),
  ownerId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  collaborators: z.array(collectionCollaboratorSchema).optional(),
});
export type Collection = z.infer<typeof collectionSchema>;

export const flashcardSchema = z.object({
  id: z.string().uuid(),
  question: z.string(),
  answer: z.string(),
  type: flashcardTypeSchema,
  collectionId: z.string().uuid(),
  createdBy: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Flashcard = z.infer<typeof flashcardSchema>;

export const reviewProgressSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  flashcardId: z.string().uuid(),
  easeFactor: z.number(),
  interval: z.number(),
  dueAt: z.string(),
  status: reviewStatusSchema,
  learningStep: z.number(),
  reviewCount: z.number(),
  lapseCount: z.number(),
  lastReviewedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  flashcard: flashcardSchema.optional(),
});
export type ReviewProgress = z.infer<typeof reviewProgressSchema>;

export const collectionStatsSchema = z.object({
  totalCards: z.number(),
  newCards: z.number(),
  learningCards: z.number(),
  reviewCards: z.number(),
  dueCards: z.number(),
  averageEase: z.number(),
  totalReviews: z.number(),
  totalLapses: z.number(),
  matureCards: z.number(),
});
export type CollectionStats = z.infer<typeof collectionStatsSchema>;

export const signUpBodySchema = z
  .object({
    name: z.string().min(1),
    email: z.string().email(),
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type SignUpBody = z.infer<typeof signUpBodySchema>;

export const signInBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type SignInBody = z.infer<typeof signInBodySchema>;

export const verifyEmailBodySchema = z.object({
  email: z.string().email(),
  otp: otpCodeSchema,
});
export type VerifyEmailBody = z.infer<typeof verifyEmailBodySchema>;

export const resendVerificationBodySchema = z.object({
  email: z.string().email(),
});
export type ResendVerificationBody = z.infer<
  typeof resendVerificationBodySchema
>;

export const forgotPasswordBodySchema = z.object({
  email: z.string().email(),
});
export type ForgotPasswordBody = z.infer<typeof forgotPasswordBodySchema>;

export const resetPasswordBodySchema = z
  .object({
    token: z.string().min(1),
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type ResetPasswordBody = z.infer<typeof resetPasswordBodySchema>;

export const createCollectionBodySchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  isPublic: z.boolean().optional().default(false),
});
export type CreateCollectionBody = z.infer<typeof createCollectionBodySchema>;

export const updateCollectionBodySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  isPublic: z.boolean().optional(),
});
export type UpdateCollectionBody = z.infer<typeof updateCollectionBodySchema>;

export const addCollaboratorBodySchema = z.object({
  email: z.string().email(),
  role: collaboratorRoleSchema.optional().default("viewer"),
});
export type AddCollaboratorBody = z.infer<typeof addCollaboratorBodySchema>;

export const createFlashcardBodySchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  type: flashcardTypeSchema.optional().default("simple"),
});
export type CreateFlashcardBody = z.infer<typeof createFlashcardBodySchema>;

export const updateFlashcardBodySchema = z.object({
  question: z.string().min(1).optional(),
  answer: z.string().min(1).optional(),
  type: flashcardTypeSchema.optional(),
});
export type UpdateFlashcardBody = z.infer<typeof updateFlashcardBodySchema>;

export const submitReviewBodySchema = z.object({
  rating: reviewRatingSchema,
});
export type SubmitReviewBody = z.infer<typeof submitReviewBodySchema>;

export const listMyCollectionsResponseSchema = z.object({
  ownedCollections: z.array(collectionSchema),
  sharedCollections: z.array(collectionSchema),
});
export type ListMyCollectionsResponse = z.infer<
  typeof listMyCollectionsResponseSchema
>;

export const getCollectionResponseSchema = z.object({
  collection: collectionSchema,
  role: collectionRoleSchema,
});
export type GetCollectionResponse = z.infer<typeof getCollectionResponseSchema>;

export const getCollectionFlashcardsResponseSchema = z.object({
  flashcards: z.array(flashcardSchema),
  role: collectionRoleSchema,
});
export type GetCollectionFlashcardsResponse = z.infer<
  typeof getCollectionFlashcardsResponseSchema
>;

export const getFlashcardResponseSchema = z.object({
  flashcard: flashcardSchema,
  role: collectionRoleSchema,
});
export type GetFlashcardResponse = z.infer<typeof getFlashcardResponseSchema>;

export const submitReviewResponseSchema = z.object({
  review: reviewProgressSchema,
});
export type SubmitReviewResponse = z.infer<typeof submitReviewResponseSchema>;

export const dueCardsResponseSchema = z.object({
  reviews: z.array(reviewProgressSchema),
});
export type DueCardsResponse = z.infer<typeof dueCardsResponseSchema>;

export const allReviewsResponseSchema = z.object({
  reviews: z.array(reviewProgressSchema),
});
export type AllReviewsResponse = z.infer<typeof allReviewsResponseSchema>;

export const collectionStatsResponseSchema = z.object({
  stats: collectionStatsSchema,
});
export type CollectionStatsResponse = z.infer<
  typeof collectionStatsResponseSchema
>;

export const clearProgressResponseSchema = z.object({
  deleted: z.number(),
  message: z.string(),
});

export const chatSessionSummarySchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  preview: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type ChatSessionSummary = z.infer<typeof chatSessionSummarySchema>;

export const chatSessionDetailSchema = chatSessionSummarySchema.extend({
  messages: z.array(uiMessageSchema),
});
export type ChatSessionDetail = z.infer<typeof chatSessionDetailSchema>;

export const listChatSessionsResponseSchema = z.object({
  sessions: z.array(chatSessionSummarySchema),
});
export type ListChatSessionsResponse = z.infer<
  typeof listChatSessionsResponseSchema
>;

export const getChatSessionResponseSchema = z.object({
  session: chatSessionDetailSchema,
});
export type GetChatSessionResponse = z.infer<
  typeof getChatSessionResponseSchema
>;

export const createChatSessionBodySchema = z.object({
  messages: z.array(uiMessageSchema).optional(),
});
export type CreateChatSessionBody = z.infer<typeof createChatSessionBodySchema>;

export const createChatSessionResponseSchema = z.object({
  session: chatSessionDetailSchema,
});
export type CreateChatSessionResponse = z.infer<
  typeof createChatSessionResponseSchema
>;

export const streamChatSessionBodySchema = z.object({
  message: uiMessageSchema,
});
export type StreamChatSessionBody = z.infer<typeof streamChatSessionBodySchema>;

export const streamDraftChatBodySchema = z.object({
  message: uiMessageSchema,
});
export type StreamDraftChatBody = z.infer<typeof streamDraftChatBodySchema>;
export type ClearProgressResponse = z.infer<typeof clearProgressResponseSchema>;

export const userProfileResponseSchema = z.object({
  user: sessionUserSchema.extend({
    emailAddresses: z.array(z.string().email()),
  }),
});
export type UserProfileResponse = z.infer<typeof userProfileResponseSchema>;

export const searchUsersResponseSchema = z.object({
  emails: z.array(z.string().email()),
});
export type SearchUsersResponse = z.infer<typeof searchUsersResponseSchema>;

export const refreshTokenBodySchema = z.object({
  refresh_token: z.string(),
});
export type RefreshTokenBody = z.infer<typeof refreshTokenBodySchema>;

export const registerResponseSchema = z.object({
  email: z.string().email(),
  message: z.string(),
  requiresEmailVerification: z.literal(true),
});
export type RegisterResponse = z.infer<typeof registerResponseSchema>;

export const signInResponseSchema = z.object({
  user: sessionUserSchema,
});
export type SignInResponse = z.infer<typeof signInResponseSchema>;

export const refreshTokenResponseSchema = z.object({
  success: z.literal(true),
});
export type RefreshTokenResponse = z.infer<typeof refreshTokenResponseSchema>;

export const authMessageResponseSchema = z.object({
  message: z.string(),
});
export type AuthMessageResponse = z.infer<typeof authMessageResponseSchema>;

export const apiErrorSchema = z.object({
  statusCode: z.number(),
  error: z.string(),
  message: z.string(),
});
export type ApiError = z.infer<typeof apiErrorSchema>;
