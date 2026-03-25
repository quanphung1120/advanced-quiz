import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { CookieOptions, Request, Response } from "express";
import {
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
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
import { ZodValidationPipe } from "../common/zod-validation.pipe.js";
import { AuthGuard } from "./auth.guard.js";
import { AuthService } from "./auth.service.js";
import { CurrentUser } from "./current-user.decorator.js";
import type { AuthenticatedUser } from "../common/authenticated-request.js";

const ACCESS_COOKIE_MAX_AGE_SECONDS = 15 * 60;
const REFRESH_COOKIE_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

@ApiTags("auth")
@Controller("api/auth")
export class AuthController {
  private readonly isSecure: boolean;

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    this.isSecure =
      this.configService.getOrThrow<string>("NODE_ENV") === "production";
  }

  private get baseCookieOptions(): CookieOptions {
    return {
      path: "/",
      httpOnly: true,
      secure: this.isSecure,
      sameSite: "lax" as const,
    };
  }

  private setAuthCookies(
    response: Response,
    tokens: { accessToken: string; refreshToken: string },
  ) {
    response.cookie("access_token", tokens.accessToken, {
      ...this.baseCookieOptions,
      maxAge: ACCESS_COOKIE_MAX_AGE_SECONDS * 1000,
    });
    response.cookie("refresh_token", tokens.refreshToken, {
      ...this.baseCookieOptions,
      maxAge: REFRESH_COOKIE_MAX_AGE_SECONDS * 1000,
    });
  }

  private clearAuthCookies(response: Response) {
    response.clearCookie("access_token", this.baseCookieOptions);
    response.clearCookie("refresh_token", this.baseCookieOptions);
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
  async login(
    @Body() body: SignInBody,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.signIn(body);
    this.setAuthCookies(response, result);
    return { user: result.user };
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
  async verifyEmail(
    @Body() body: VerifyEmailBody,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.verifyEmail(body);
    this.setAuthCookies(response, result);
    return { user: result.user };
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
    @Res({ passthrough: true }) response: Response,
  ) {
    this.clearAuthCookies(response);
    return this.authService.resetPassword(body);
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Refresh access token" })
  @ApiResponse({ status: 200, description: "Token refreshed successfully" })
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies?.["refresh_token"];
    if (!refreshToken) {
      this.clearAuthCookies(response);
      response.status(HttpStatus.UNAUTHORIZED);
      return { message: "No refresh token provided" };
    }

    try {
      const result = await this.authService.refreshSession(refreshToken);
      this.setAuthCookies(response, result);
      return { user: result.user };
    } catch (error) {
      this.clearAuthCookies(response);
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
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.logout(user.id);
    this.clearAuthCookies(response);
    return { message: "Logged out successfully" };
  }
}
