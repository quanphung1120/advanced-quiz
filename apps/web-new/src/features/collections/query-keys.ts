export const collectionQueryKeys = {
  all: () => ["collections"] as const,
  detail: (id: string) => ["collections", id] as const,
  userSearch: (query: string) => ["users", "search", query] as const,
};
