export const chatQueryKeys = {
  sessions: () => ["chat", "sessions"] as const,
  session: (id: string) => ["chat", "sessions", id] as const,
};
