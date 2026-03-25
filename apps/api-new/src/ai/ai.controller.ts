import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ApiCookieAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import {
  convertToModelMessages,
  consumeStream,
  createIdGenerator,
  streamText,
  type UIMessage,
} from "ai";
import type {
  StreamChatSessionBody,
  StreamDraftChatBody,
} from "@advanced-quiz/contracts";
import type { Response } from "express";
import { AuthGuard } from "../auth/auth.guard.js";
import { CurrentUser } from "../auth/current-user.decorator.js";
import type { AuthenticatedUser } from "../common/authenticated-request.js";
import { AIService } from "./ai.service.js";

@ApiTags("chat")
@ApiCookieAuth()
@UseGuards(AuthGuard)
@Controller("api/v1/chat")
export class AIController {
  constructor(private readonly aiService: AIService) { }

  @Get("sessions")
  @ApiOperation({ summary: "List the current user's chat sessions" })
  listSessions(@CurrentUser() user: AuthenticatedUser) {
    return this.aiService.listSessions(user.id);
  }

  @Get("sessions/:id")
  @ApiOperation({ summary: "Get a chat session and its persisted transcript" })
  getSession(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.aiService.getSession(id, user.id);
  }

  @Delete("sessions/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a chat session" })
  deleteSession(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.aiService.deleteSession(id, user.id);
  }

  /**
   * First-message endpoint: creates a new session and streams the first turn.
   * Returns the new session ID in the `X-Session-Id` response header so the
   * client can navigate before the stream completes.
   */
  @Post("sessions/stream")
  @ApiOperation({
    summary: "Create a new session and stream the first assistant response",
  })
  async createAndStreamSession(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: StreamDraftChatBody,
    @Res() response: Response,
  ) {
    const session = await this.aiService.createSession(user.id);
    const sessionId = session.session.id;
    const originalMessages = await this.aiService.buildDraftPrompt(
      body.message as unknown as UIMessage,
    );

    response.setHeader("X-Session-Id", sessionId);
    response.setHeader("Access-Control-Expose-Headers", "X-Session-Id");

    const result = streamText({
      model: this.aiService.getPrimaryModel(),
      messages: await convertToModelMessages(originalMessages),
    });

    result.pipeUIMessageStreamToResponse(response, {
      originalMessages,
      generateMessageId: MESSAGE_ID_GENERATOR,
      consumeSseStream: consumeStream,
      onFinish: async ({ messages, isAborted }) => {
        if (isAborted) {
          await this.aiService.deleteSessionIfEmpty(sessionId);
          return;
        }

        await this.aiService.persistCompletedTurn(
          sessionId,
          "New chat",
          messages,
        );
      },
    });
  }

  /**
   * Subsequent-turn endpoint: streams a follow-up message in an existing session.
   */
  @Post("sessions/:id/stream")
  @ApiOperation({ summary: "Stream the assistant response for a chat session" })
  async streamSession(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: StreamChatSessionBody,
    @Res() response: Response,
  ) {
    const { session, messages: originalMessages } =
      await this.aiService.getSessionPrompt(
        id,
        user.id,
        body.message as unknown as UIMessage,
      );

    const result = streamText({
      model: this.aiService.getPrimaryModel(),
      messages: await convertToModelMessages(originalMessages),
    });

    result.pipeUIMessageStreamToResponse(response, {
      originalMessages,
      generateMessageId: MESSAGE_ID_GENERATOR,
      consumeSseStream: consumeStream,
      onFinish: async ({ messages, isAborted }) => {
        if (isAborted) {
          return;
        }

        await this.aiService.persistCompletedTurn(
          id,
          session.title,
          messages,
        );
      },
    });
  }
}

const MESSAGE_ID_GENERATOR = createIdGenerator({
  prefix: "msg",
  size: 16,
});
