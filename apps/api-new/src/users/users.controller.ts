import { Controller, Get, Inject, Query, UseGuards } from "@nestjs/common";
import { ApiCookieAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "../auth/auth.guard.js";
import { CurrentUser } from "../auth/current-user.decorator.js";
import type { AuthenticatedUser } from "../common/authenticated-request.js";
import { UsersService } from "./users.service.js";

@ApiTags("users")
@ApiCookieAuth()
@UseGuards(AuthGuard)
@Controller("api/v1/users")
export class UsersController {
  constructor(
    @Inject(UsersService) private readonly usersService: UsersService,
  ) {}

  @Get("me")
  @ApiOperation({ summary: "Get current user profile" })
  getCurrentUser(@CurrentUser() user: AuthenticatedUser) {
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image ?? null,
        emailAddresses: [user.email],
      },
    };
  }

  @Get("search-email-addresses")
  @ApiOperation({ summary: "Search users by email address" })
  async searchEmailAddresses(
    @CurrentUser() user: AuthenticatedUser,
    @Query("query") query?: string,
  ) {
    if (!query) {
      return { emails: [] };
    }

    return {
      emails: await this.usersService.searchUserEmails(query, user.id),
    };
  }
}
