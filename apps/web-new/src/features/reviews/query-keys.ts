export const reviewQueryKeys = {
  due: (collectionId: string) => ["reviews", collectionId, "due"] as const,
  all: (collectionId: string) => ["reviews", collectionId, "all"] as const,
  stats: (collectionId: string) => ["reviews", collectionId, "stats"] as const,
};
