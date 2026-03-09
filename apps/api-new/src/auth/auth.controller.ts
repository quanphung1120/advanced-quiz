import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Req,
  Res,
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import type { FastifyReply, FastifyRequest } from "fastify";
import {
  forgotPasswordBodySchema,
  resetPasswordBodySchema,
  resendVerificationBodySchema,
  signInBodySchema,
  signUpBodySchema,
  verifyEmailBodySchema,
  type ForgotPasswordBody,
  type ResetPasswordBody,
  type ResendVerificationBody,
  type SignInBody,
  type SignUpBody,
  type VerifyEmailBody,
} from "@advanced-quiz/contracts";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { AuthGuard } from "./auth.guard";
import { AuthService } from "./auth.service";
import { CurrentUser } from "./current-user.decorator";
import type { AuthenticatedUser } from "../common/authenticated-request";

const ACCESS_COOKIE_MAX_AGE_SECONDS = 15 * 60;
const REFRESH_COOKIE_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

@ApiTags("auth")
@Controller("api/auth")
export class AuthController {
  private readonly isSecure: boolean;

  constructor(
    @Inject(AuthService)
    private readonly authService: AuthService,
    @Inject(ConfigService)
    private configService: ConfigService,
  ) {
    this.isSecure =
      this.configService.getOrThrow<string>("NODE_ENV") === "production";
  }

  private get baseCookieOptions() {
    return {
      path: "/",
      httpOnly: true,
      secure: this.isSecure,
      sameSite: "lax" as const,
    };
  }

  private setAuthCookies(
    reply: FastifyReply,
    tokens: { accessToken: string; refreshToken: string },
  ) {
    reply.setCookie("access_token", tokens.accessToken, {
      ...this.baseCookieOptions,
      maxAge: ACCESS_COOKIE_MAX_AGE_SECONDS,
    });
    reply.setCookie("refresh_token", tokens.refreshToken, {
      ...this.baseCookieOptions,
      maxAge: REFRESH_COOKIE_MAX_AGE_SECONDS,
    });
  }

  private clearAuthCookies(reply: FastifyReply) {
    reply.clearCookie("access_token", this.baseCookieOptions);
    reply.clearCookie("refresh_token", this.baseCookieOptions);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(signInBodySchema))
  @ApiOperation({ summary: "User login" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        email: { type: "string" },
        password: { type: "string" },
      },
      required: ["email", "password"],
    },
  })
  @ApiResponse({ status: 200, description: "Login successful" })
  async login(@Body() body: SignInBody, @Res() reply: FastifyReply) {
    const result = await this.authService.signIn(body);
    this.setAuthCookies(reply, result);
    return reply.send({ user: result.user });
  }

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(signUpBodySchema))
  @ApiOperation({ summary: "Register a user and send a verification code" })
  async register(@Body() body: SignUpBody) {
    return this.authService.register(body);
  }

  @Post("verify-email")
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(verifyEmailBodySchema))
  @ApiOperation({ summary: "Verify email with OTP and start a session" })
  async verifyEmail(@Body() body: VerifyEmailBody, @Res() reply: FastifyReply) {
    const result = await this.authService.verifyEmail(body);
    this.setAuthCookies(reply, result);
    return reply.send({ user: result.user });
  }

  @Post("resend-verification")
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(resendVerificationBodySchema))
  @ApiOperation({ summary: "Resend verification OTP" })
  async resendVerification(@Body() body: ResendVerificationBody) {
    return this.authService.resendVerification(body);
  }

  @Post("forgot-password")
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(forgotPasswordBodySchema))
  @ApiOperation({ summary: "Request a password reset email" })
  async forgotPassword(@Body() body: ForgotPasswordBody) {
    return this.authService.forgotPassword(body);
  }

  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(resetPasswordBodySchema))
  @ApiOperation({ summary: "Reset password using a recovery token" })
  async resetPassword(
    @Body() body: ResetPasswordBody,
    @Res() reply: FastifyReply,
  ) {
    this.clearAuthCookies(reply);
    return reply.send(await this.authService.resetPassword(body));
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Refresh access token" })
  @ApiResponse({ status: 200, description: "Token refreshed successfully" })
  async refresh(@Req() req: FastifyRequest, @Res() reply: FastifyReply) {
    const cookies = req.cookies as Record<string, string> | undefined;
    const refreshToken = cookies?.["refresh_token"];
    if (!refreshToken) {
      this.clearAuthCookies(reply);
      return reply
        .code(HttpStatus.UNAUTHORIZED)
        .send({ message: "No refresh token provided" });
    }

    try {
      const result = await this.authService.refreshSession(refreshToken);
      this.setAuthCookies(reply, result);
      return reply.send({ user: result.user });
    } catch (error) {
      this.clearAuthCookies(reply);
      throw error;
    }
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: "User logout" })
  @ApiResponse({ status: 200, description: "Logout successful" })
  async logout(
    @CurrentUser() user: AuthenticatedUser,
    @Res() reply: FastifyReply,
  ) {
    await this.authService.logout(user.id);
    this.clearAuthCookies(reply);
    return reply.send({ message: "Logged out successfully" });
  }
}
