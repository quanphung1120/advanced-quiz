import type { SessionUser } from "@advanced-quiz/contracts";
import type { Request } from "express";

export type AuthenticatedUser = SessionUser;

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
