import {
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { devToolsMiddleware } from "@ai-sdk/devtools";
import { gateway } from "@ai-sdk/gateway";
import type { Prisma } from "@advanced-quiz/db";
import { type ChatSessionSummary } from "@advanced-quiz/contracts";
import {
  wrapLanguageModel,
  type LanguageModel,
  type UIMessage,
} from "ai";
import { DatabaseService } from "../database/database.service.js";
import { DEFAULT_SESSION_TITLE } from "./ai.constants.js";
import { generateSessionTitle } from "./ai.prompts.js";
import {
  appendLatestMessage,
  buildFallbackMetadata,
  deserializeMessages,
  normalizeMessages,
  serializeSession,
  type SessionWithMessagesRecord,
} from "./ai.utils.js";

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);

  constructor(
    private readonly databaseService: DatabaseService,
  ) { }

  async listSessions(userId: string): Promise<{ sessions: ChatSessionSummary[] }> {
    const sessions = await this.databaseService.database.chatSession.findMany({
      where: { userId },
      orderBy: [{ updatedAt: "desc" }],
      select: {
        id: true,
        title: true,
        preview: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      sessions: sessions.map((session) => serializeSession(session)),
    };
  }

  async createSession(userId: string) {
    const session = await this.databaseService.database.chatSession.create({
      data: {
        userId,
        messages: [] as Prisma.InputJsonValue,
      },
      select: {
        id: true,
        title: true,
        preview: true,
        createdAt: true,
        updatedAt: true,
        messages: true,
      },
    });

    return {
      session: {
        ...serializeSession(session),
        messages: deserializeMessages(session.messages),
      },
    };
  }

  async getSession(sessionId: string, userId: string) {
    const session = await this.getOwnedSessionOrThrow(sessionId, userId);

    return {
      session: {
        ...serializeSession(session),
        messages: deserializeMessages(session.messages),
      },
    };
  }

  async getSessionPrompt(
    sessionId: string,
    userId: string,
    latestMessage: UIMessage,
  ) {
    const session = await this.getOwnedSessionOrThrow(sessionId, userId);

    return {
      session,
      messages: await appendLatestMessage(session.messages, latestMessage),
    };
  }

  async buildDraftPrompt(latestMessage: UIMessage) {
    return appendLatestMessage([], latestMessage);
  }

  async deleteSession(sessionId: string, userId: string): Promise<void> {
    await this.getOwnedSessionOrThrow(sessionId, userId);

    await this.databaseService.database.chatSession.delete({
      where: { id: sessionId },
    });

    this.logger.log(`Deleted session ${sessionId} for user ${userId}`);
  }

  async deleteSessionIfEmpty(sessionId: string): Promise<void> {
    try {
      const session = await this.databaseService.database.chatSession.findUnique({
        where: { id: sessionId },
        select: {
          messages: true,
        },
      });

      if (!session) {
        return;
      }

      if (deserializeMessages(session.messages).length === 0) {
        await this.databaseService.database.chatSession.delete({
          where: { id: sessionId },
        });
        this.logger.debug(`Deleted empty session ${sessionId}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Failed to delete empty session ${sessionId}: ${message}`);
    }
  }

  async persistCompletedTurn(
    sessionId: string,
    currentTitle: string,
    messages: UIMessage[],
  ) {
    const normalizedMessages = await normalizeMessages(messages);

    if (normalizedMessages.length === 0) {
      await this.deleteSessionIfEmpty(sessionId);
      return;
    }

    const fallbackMetadata = buildFallbackMetadata(normalizedMessages);
    const resolvedTitle = await generateSessionTitle({
      currentTitle,
      fallbackTitle: fallbackMetadata.title,
      messages: normalizedMessages,
      model: this.getBackgroundModel(),
      logWarning: (message) => this.logger.warn(message),
    });

    await this.databaseService.database.chatSession.update({
      where: { id: sessionId },
      data: {
        messages: normalizedMessages as unknown as Prisma.InputJsonValue,
        title: resolvedTitle ?? fallbackMetadata.title ?? DEFAULT_SESSION_TITLE,
        preview: fallbackMetadata.preview,
      },
    });
  }

  getPrimaryModel(): LanguageModel {
    return wrapLanguageModel({
      model: gateway("xai/grok-code-fast-1"),
      middleware: devToolsMiddleware(),
    });
  }

  getBackgroundModel(): LanguageModel {
    return wrapLanguageModel({
      model: gateway("xai/grok-code-fast-1"),
      middleware: devToolsMiddleware(),
    });
  }

  private async getOwnedSessionOrThrow(
    sessionId: string,
    userId: string,
  ): Promise<SessionWithMessagesRecord> {
    const session = await this.databaseService.database.chatSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
      select: {
        id: true,
        title: true,
        preview: true,
        createdAt: true,
        updatedAt: true,
        messages: true,
      },
    });

    if (!session) {
      throw new NotFoundException("Chat session not found");
    }

    return session;
  }
}
