import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Request,
  Res,
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
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

const ACCESS_COOKIE_MAX_AGE_SECONDS = 15 * 60;
const REFRESH_COOKIE_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

@ApiTags("auth")
@Controller("api/auth")
export class AuthController {
  constructor(
    @Inject(AuthService) private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  private setAuthCookies(
    reply: FastifyReply,
    tokens: { accessToken: string; refreshToken: string },
  ) {
    reply.setCookie("access_token", tokens.accessToken, {
      path: "/",
      httpOnly: true,
      secure: this.configService.get("NODE_ENV") === "production",
      sameSite: "lax",
      maxAge: ACCESS_COOKIE_MAX_AGE_SECONDS,
    });
    reply.setCookie("refresh_token", tokens.refreshToken, {
      path: "/",
      httpOnly: true,
      secure: this.configService.get("NODE_ENV") === "production",
      sameSite: "lax",
      maxAge: REFRESH_COOKIE_MAX_AGE_SECONDS,
    });
  }

  private clearAuthCookies(reply: FastifyReply) {
    reply.clearCookie("access_token", {
      path: "/",
      httpOnly: true,
      secure: this.configService.get("NODE_ENV") === "production",
      sameSite: "lax",
    });
    reply.clearCookie("refresh_token", {
      path: "/",
      httpOnly: true,
      secure: this.configService.get("NODE_ENV") === "production",
      sameSite: "lax",
    });
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
  @UsePipes(new ZodValidationPipe(signUpBodySchema))
  @ApiOperation({ summary: "Register a user and send a verification code" })
  async register(@Body() body: SignUpBody, @Res() reply: FastifyReply) {
    const result = await this.authService.register(body);
    return reply.code(HttpStatus.CREATED).send(result);
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
  async resendVerification(
    @Body() body: ResendVerificationBody,
    @Res() reply: FastifyReply,
  ) {
    return reply.send(await this.authService.resendVerification(body));
  }

  @Post("forgot-password")
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(forgotPasswordBodySchema))
  @ApiOperation({ summary: "Request a password reset email" })
  async forgotPassword(
    @Body() body: ForgotPasswordBody,
    @Res() reply: FastifyReply,
  ) {
    return reply.send(await this.authService.forgotPassword(body));
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

  @Get("me")
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Get current user" })
  @ApiResponse({ status: 200, description: "Returns the current user" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getMe(@Request() req: { user: unknown }) {
    return { user: req.user };
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Rotate refresh token and issue a new access token",
  })
  async refresh(@Request() req: FastifyRequest, @Res() reply: FastifyReply) {
    const refreshToken = (
      req as FastifyRequest & { cookies?: Record<string, string> }
    ).cookies?.refresh_token;

    if (!refreshToken) {
      this.clearAuthCookies(reply);
      return reply.code(HttpStatus.UNAUTHORIZED).send({
        statusCode: HttpStatus.UNAUTHORIZED,
        error: "Unauthorized",
        message: "Refresh token missing",
      });
    }

    const result = await this.authService.refreshSession(refreshToken);
    this.setAuthCookies(reply, result);
    return reply.send({ success: true });
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "User logout" })
  @ApiResponse({ status: 200, description: "Logout successful" })
  async logout(
    @Request() req: { user: { id: string } },
    @Res() reply: FastifyReply,
  ) {
    await this.authService.logout(req.user.id);
    this.clearAuthCookies(reply);
    return reply.send({ message: "Logged out successfully" });
  }
}
