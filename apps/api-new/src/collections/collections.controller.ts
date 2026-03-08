import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  addCollaboratorBodySchema,
  createCollectionBodySchema,
  createFlashcardBodySchema,
  updateCollectionBodySchema,
  updateFlashcardBodySchema,
} from "@advanced-quiz/contracts";
import { ApiCookieAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "../auth/auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import type { AuthenticatedUser } from "../common/authenticated-request";
import { parseWithSchema } from "../common/http-exception.util";
import { CollectionsService } from "./collections.service";

@ApiTags("collections")
@ApiCookieAuth()
@UseGuards(AuthGuard)
@Controller("api/v1/collections")
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Get("me")
  @ApiOperation({ summary: "List current user's owned and shared collections" })
  listMyCollections(@CurrentUser() user: AuthenticatedUser) {
    return this.collectionsService.listCollectionsForUser(user.id);
  }

  @Post()
  @ApiOperation({ summary: "Create a collection" })
  createCollection(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: unknown,
  ) {
    return this.collectionsService.createCollection(
      user.id,
      parseWithSchema(createCollectionBodySchema, body),
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a single collection" })
  getCollection(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.collectionsService.getCollection(id, user.id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update a collection" })
  updateCollection(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: unknown,
  ) {
    return this.collectionsService.updateCollection(
      id,
      user.id,
      parseWithSchema(updateCollectionBodySchema, body),
    );
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a collection" })
  deleteCollection(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.collectionsService.deleteCollection(id, user.id);
  }

  @Post(":id/collaborators")
  @ApiOperation({ summary: "Add collaborator" })
  addCollaborator(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: unknown,
  ) {
    const parsed = parseWithSchema(addCollaboratorBodySchema, body);

    return this.collectionsService.addCollaborator(id, user.id, {
      ...parsed,
      role: parsed.role ?? "viewer",
    });
  }

  @Delete(":id/collaborators/:collaboratorId")
  @ApiOperation({ summary: "Remove collaborator" })
  removeCollaborator(
    @Param("id") id: string,
    @Param("collaboratorId") collaboratorId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.collectionsService.removeCollaborator(
      id,
      collaboratorId,
      user.id,
    );
  }

  @Get(":id/flashcards")
  @ApiOperation({ summary: "List flashcards for a collection" })
  listFlashcards(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.collectionsService.listFlashcards(id, user.id);
  }

  @Get(":id/flashcards/:flashcardId")
  @ApiOperation({ summary: "Get a single flashcard" })
  getFlashcard(
    @Param("id") id: string,
    @Param("flashcardId") flashcardId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.collectionsService.getFlashcard(id, flashcardId, user.id);
  }

  @Post(":id/flashcards")
  @ApiOperation({ summary: "Create a flashcard in a collection" })
  createFlashcard(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: unknown,
  ) {
    return this.collectionsService.createFlashcard(
      id,
      user.id,
      parseWithSchema(createFlashcardBodySchema, body),
    );
  }

  @Put(":id/flashcards/:flashcardId")
  @ApiOperation({ summary: "Update a flashcard" })
  updateFlashcard(
    @Param("id") id: string,
    @Param("flashcardId") flashcardId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: unknown,
  ) {
    return this.collectionsService.updateFlashcard(
      id,
      flashcardId,
      user.id,
      parseWithSchema(updateFlashcardBodySchema, body),
    );
  }

  @Delete(":id/flashcards/:flashcardId")
  @ApiOperation({ summary: "Delete a flashcard" })
  deleteFlashcard(
    @Param("id") id: string,
    @Param("flashcardId") flashcardId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.collectionsService.deleteFlashcard(id, flashcardId, user.id);
  }

  @Post(":id/start-session")
  @ApiOperation({ summary: "Start an SRS session for a collection" })
  startSession(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.collectionsService.startSession(id, user.id);
  }

  @Get(":id/due")
  @ApiOperation({ summary: "List due review items for a collection" })
  getDueReviews(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Query("limit") limit?: string,
  ) {
    return this.collectionsService.getDueReviews(
      id,
      user.id,
      limit ? Number.parseInt(limit, 10) : undefined,
    );
  }

  @Get(":id/stats")
  @ApiOperation({ summary: "Get SRS stats for a collection" })
  getStats(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.collectionsService.getCollectionStats(id, user.id);
  }

  @Get(":id/reviews")
  @ApiOperation({ summary: "List all review progress rows for a collection" })
  getReviews(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.collectionsService.getReviews(id, user.id);
  }

  @Delete(":id/progress")
  @ApiOperation({ summary: "Clear SRS progress for a collection" })
  clearProgress(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.collectionsService.clearProgress(id, user.id);
  }
}
