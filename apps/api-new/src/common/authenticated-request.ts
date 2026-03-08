import type { SessionUser } from "@advanced-quiz/contracts";
import type { FastifyRequest } from "fastify";

export type AuthenticatedUser = SessionUser;

export interface AuthenticatedRequest extends FastifyRequest {
  user: AuthenticatedUser | null;
}
