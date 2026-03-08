import { Body, Controller, Param, Post, UseGuards } from "@nestjs/common";
import { submitReviewBodySchema } from "@advanced-quiz/contracts";
import { ApiCookieAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "../auth/auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import type { AuthenticatedUser } from "../common/authenticated-request";
import { parseWithSchema } from "../common/http-exception.util";
import { CollectionsService } from "../collections/collections.service";

@ApiTags("reviews")
@ApiCookieAuth()
@UseGuards(AuthGuard)
@Controller("api/v1/flashcards")
export class FlashcardsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Post(":id/review")
  @ApiOperation({ summary: "Submit an SRS rating for a flashcard" })
  submitReview(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: unknown,
  ) {
    const parsed = parseWithSchema(submitReviewBodySchema, body);
    return this.collectionsService.submitReview(id, user.id, parsed.rating);
  }
}
