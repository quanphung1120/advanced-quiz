import { uiMessageSchema } from "@advanced-quiz/contracts";
import { z } from "zod";

export const DEFAULT_SESSION_TITLE = "New chat";

export const persistedMessagesSchema = z.array(uiMessageSchema);
