import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService, type ConfigType } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import type {
  ForgotPasswordBody,
  RegisterResponse,
  ResetPasswordBody,
  ResendVerificationBody,
  SessionUser,
  SignInBody,
  SignInResponse,
  SignUpBody,
  VerifyEmailBody,
} from "@advanced-quiz/contracts";
import * as bcrypt from "bcrypt";
import {
  createHmac,
  randomBytes,
  randomInt,
  randomUUID,
  timingSafeEqual,
} from "node:crypto";
import { and, desc, eq, gt, isNull, sql } from "drizzle-orm";
import {
  type DatabaseClient,
  emailOtps,
  passwordResetTokens,
  refreshTokens,
  users,
} from "@advanced-quiz/db";
import { DATABASE } from "../database/database.service";
import { UsersService } from "../users/users.service";
import { AuthMailerService } from "./auth.mailer";
import type { JwtPayload } from "./auth.types";

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
const REFRESH_TOKEN_TTL = "7d";
const EMAIL_OTP_EXPIRY_MINUTES = 10;
const PASSWORD_RESET_EXPIRY_MINUTES = 30;
const EMAIL_OTP_RESEND_COOLDOWN_SECONDS = 60;
const PASSWORD_RESET_RESEND_COOLDOWN_SECONDS = 60;
const MAX_OTP_ATTEMPTS = 5;

@Injectable()
export class AuthService {
  private readonly authSecret: string;
  private readonly webUrl: string;

  constructor(
    @Inject(UsersService)
    private readonly usersService: UsersService,
    @Inject(JwtService)
    private readonly jwtService: JwtService,
    @Inject(DATABASE) private readonly database: DatabaseClient,
    @Inject(AuthMailerService)
    private readonly authMailerService: AuthMailerService,
    @Inject(ConfigService)
    private configService: ConfigService,
  ) {
    this.authSecret = this.configService.getOrThrow<string>("AUTH_SECRET");
    this.webUrl = this.configService.getOrThrow<string>("WEB_URL");
  }

  async register(data: SignUpBody): Promise<RegisterResponse> {
    const existingUser = await this.usersService.findByEmail(data.email);

    if (existingUser) {
      if (existingUser.emailVerified) {
        throw new ConflictException(
          "An account with this email already exists",
        );
      }

      await this.resendVerification({ email: existingUser.email });

      return {
        email: existingUser.email,
        message: "Verification code sent to your email address",
        requiresEmailVerification: true,
      };
    }

    const { email, name, password } = data;
    const user = await this.usersService.create({ email, name, password });
    await this.issueEmailVerificationOtp(user);

    return {
      email: user.email,
      message: "Verification code sent to your email address",
      requiresEmailVerification: true,
    };
  }

  async signIn(data: SignInBody): Promise<SignInResponse & AuthTokens> {
    const user = await this.usersService.findByEmailWithPassword(data.email);

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException("Invalid credentials");
    }

    if (!user.emailVerified) {
      try {
        await this.resendVerification({ email: user.email });
      } catch {
        // best-effort resend; proceed to throw the verification-required error
      }
      throw new ForbiddenException({
        statusCode: 403,
        error: "Forbidden",
        message: "Verify your email before signing in",
        code: "EMAIL_VERIFICATION_REQUIRED",
        requiresEmailVerification: true,
        email: user.email,
      });
    }

    return this.createAuthenticatedSession(user);
  }

  async verifyEmail(
    data: VerifyEmailBody,
  ): Promise<SignInResponse & AuthTokens> {
    const user = await this.usersService.findByEmail(data.email);

    if (!user) {
      throw new BadRequestException("Invalid or expired verification code");
    }

    if (user.emailVerified) {
      return this.createAuthenticatedSession(user);
    }

    const otpRecord = await this.database.query.emailOtps.findFirst({
      where: and(
        eq(emailOtps.userId, user.id),
        eq(emailOtps.purpose, "email_verification"),
      ),
      orderBy: [desc(emailOtps.createdAt)],
    });

    const now = new Date();

    if (!otpRecord || otpRecord.expiresAt <= now) {
      throw new BadRequestException("Invalid or expired verification code");
    }

    const codeHash = this.hashSecret(data.otp);
    const hashesMatch = timingSafeEqual(
      Buffer.from(otpRecord.codeHash, "hex"),
      Buffer.from(codeHash, "hex"),
    );
    if (!hashesMatch) {
      const [updated] = await this.database
        .update(emailOtps)
        .set({ attempts: sql`${emailOtps.attempts} + 1` })
        .where(eq(emailOtps.id, otpRecord.id))
        .returning({ attempts: emailOtps.attempts });

      if ((updated?.attempts ?? 0) >= MAX_OTP_ATTEMPTS) {
        await this.database
          .delete(emailOtps)
          .where(
            and(
              eq(emailOtps.userId, user.id),
              eq(emailOtps.purpose, "email_verification"),
            ),
          );
      }

      throw new BadRequestException("Invalid or expired verification code");
    }

    const [verifiedUser] = await this.database
      .update(users)
      .set({
        emailVerified: true,
        emailVerifiedAt: now,
        updatedAt: now,
      })
      .where(eq(users.id, user.id))
      .returning();

    if (!verifiedUser) {
      throw new InternalServerErrorException("Unable to verify account");
    }

    await this.database
      .delete(emailOtps)
      .where(
        and(
          eq(emailOtps.userId, user.id),
          eq(emailOtps.purpose, "email_verification"),
        ),
      );

    return this.createAuthenticatedSession(verifiedUser);
  }

  async resendVerification(data: ResendVerificationBody) {
    const user = await this.usersService.findByEmail(data.email);

    if (!user || user.emailVerified) {
      return {
        message:
          "If an unverified account exists for that email, a code has been sent",
      };
    }

    const existingOtp = await this.database.query.emailOtps.findFirst({
      where: and(
        eq(emailOtps.userId, user.id),
        eq(emailOtps.purpose, "email_verification"),
      ),
      orderBy: [desc(emailOtps.createdAt)],
    });

    if (
      existingOtp &&
      this.isWithinCooldown(
        existingOtp.lastSentAt,
        EMAIL_OTP_RESEND_COOLDOWN_SECONDS,
      )
    ) {
      return {
        message:
          "If an unverified account exists for that email, a code has been sent",
      };
    }

    await this.issueEmailVerificationOtp(user);

    return {
      message:
        "If an unverified account exists for that email, a code has been sent",
    };
  }

  async forgotPassword(data: ForgotPasswordBody) {
    const user = await this.usersService.findByEmail(data.email);

    if (!user || !user.emailVerified) {
      return {
        message:
          "If an account exists for that email, password reset instructions have been sent",
      };
    }

    const existingToken =
      await this.database.query.passwordResetTokens.findFirst({
        where: and(
          eq(passwordResetTokens.userId, user.id),
          isNull(passwordResetTokens.usedAt),
        ),
        orderBy: [desc(passwordResetTokens.createdAt)],
      });

    if (
      existingToken &&
      this.isWithinCooldown(
        existingToken.createdAt,
        PASSWORD_RESET_RESEND_COOLDOWN_SECONDS,
      )
    ) {
      return {
        message:
          "If an account exists for that email, password reset instructions have been sent",
      };
    }

    await this.database
      .delete(passwordResetTokens)
      .where(eq(passwordResetTokens.userId, user.id));

    const resetToken = this.generateResetToken();
    const resetTokenHash = this.hashSecret(resetToken);
    const expiresAt = this.minutesFromNow(PASSWORD_RESET_EXPIRY_MINUTES);

    await this.database.insert(passwordResetTokens).values({
      id: randomUUID(),
      userId: user.id,
      tokenHash: resetTokenHash,
      expiresAt,
    });

    const resetUrl = new URL("/reset-password", this.webUrl);
    resetUrl.searchParams.set("token", resetToken);

    try {
      await this.authMailerService.sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        resetUrl: resetUrl.toString(),
        expiresInMinutes: PASSWORD_RESET_EXPIRY_MINUTES,
        idempotencyKey: `password-reset:${resetTokenHash}`,
      });
    } catch {
      await this.database
        .delete(passwordResetTokens)
        .where(
          and(
            eq(passwordResetTokens.userId, user.id),
            eq(passwordResetTokens.tokenHash, resetTokenHash),
          ),
        );
      throw new InternalServerErrorException(
        "Unable to send password reset email",
      );
    }

    return {
      message:
        "If an account exists for that email, password reset instructions have been sent",
    };
  }

  async resetPassword(data: ResetPasswordBody) {
    const tokenHash = this.hashSecret(data.token);
    const now = new Date();

    const resetRecord = await this.database.query.passwordResetTokens.findFirst(
      {
        where: and(
          eq(passwordResetTokens.tokenHash, tokenHash),
          isNull(passwordResetTokens.usedAt),
          gt(passwordResetTokens.expiresAt, now),
        ),
      },
    );

    if (!resetRecord) {
      throw new BadRequestException("Invalid or expired password reset link");
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    await this.database.transaction(async (tx) => {
      await tx
        .update(users)
        .set({
          password: passwordHash,
          passwordChangedAt: now,
          updatedAt: now,
        })
        .where(eq(users.id, resetRecord.userId));

      await tx
        .delete(passwordResetTokens)
        .where(eq(passwordResetTokens.id, resetRecord.id));

      await tx
        .delete(passwordResetTokens)
        .where(eq(passwordResetTokens.userId, resetRecord.userId));

      await tx
        .delete(refreshTokens)
        .where(eq(refreshTokens.userId, resetRecord.userId));
    });

    return {
      message: "Password reset successful. Sign in with your new password",
    };
  }

  async refreshSession(refreshToken: string) {
    const payload = this.verifyRefreshToken(refreshToken);

    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    if (!user.emailVerified) {
      throw new UnauthorizedException("Email verification is required");
    }

    const tokenRecord = await this.usersService.validateRefreshToken(
      user.id,
      refreshToken,
    );
    if (!tokenRecord) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    await this.usersService.deleteRefreshToken(tokenRecord.id);

    return this.createAuthenticatedSession(user);
  }

  async logout(userId: string) {
    await this.usersService.deleteAllRefreshTokens(userId);
  }

  private async issueEmailVerificationOtp(user: {
    id: string;
    email: string;
    name: string;
  }) {
    const existingOtp = await this.database.query.emailOtps.findFirst({
      where: and(
        eq(emailOtps.userId, user.id),
        eq(emailOtps.purpose, "email_verification"),
      ),
      orderBy: [desc(emailOtps.createdAt)],
    });

    if (
      existingOtp &&
      this.isWithinCooldown(
        existingOtp.lastSentAt,
        EMAIL_OTP_RESEND_COOLDOWN_SECONDS,
      )
    ) {
      throw new HttpException(
        "Please wait before requesting another verification code",
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const otp = this.generateOtp();
    const codeHash = this.hashSecret(otp);
    const expiresAt = this.minutesFromNow(EMAIL_OTP_EXPIRY_MINUTES);

    await this.database
      .delete(emailOtps)
      .where(
        and(
          eq(emailOtps.userId, user.id),
          eq(emailOtps.purpose, "email_verification"),
        ),
      );

    const [otpRecord] = await this.database
      .insert(emailOtps)
      .values({
        id: randomUUID(),
        userId: user.id,
        purpose: "email_verification",
        codeHash,
        expiresAt,
      })
      .returning({ id: emailOtps.id });

    if (!otpRecord) {
      throw new InternalServerErrorException(
        "Unable to create verification request",
      );
    }

    try {
      await this.authMailerService.sendVerificationOtp({
        to: user.email,
        name: user.name,
        otp,
        expiresInMinutes: EMAIL_OTP_EXPIRY_MINUTES,
        idempotencyKey: `email-otp:${otpRecord.id}`,
      });
    } catch {
      await this.database
        .delete(emailOtps)
        .where(eq(emailOtps.id, otpRecord.id));
      throw new InternalServerErrorException(
        "Unable to send verification email",
      );
    }
  }

  private async createAuthenticatedSession(user: {
    id: string;
    email: string;
    name: string;
    emailVerified: boolean;
  }): Promise<SignInResponse & AuthTokens> {
    const accessPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
      type: "access",
    };
    const refreshPayload: JwtPayload = {
      ...accessPayload,
      type: "refresh",
    };

    const accessToken = this.jwtService.sign(accessPayload, {
      expiresIn: `${ACCESS_TOKEN_TTL_SECONDS}s`,
    });
    const refreshToken = this.jwtService.sign(refreshPayload, {
      expiresIn: REFRESH_TOKEN_TTL,
    });

    await this.usersService.storeRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: this.toSessionUser(user),
    };
  }

  private verifyRefreshToken(token: string) {
    try {
      const payload = this.jwtService.verify<JwtPayload>(token);

      if (payload.type !== "refresh") {
        throw new UnauthorizedException("Invalid refresh token");
      }

      return payload;
    } catch {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

  private toSessionUser(user: {
    id: string;
    email: string;
    name: string;
    emailVerified: boolean;
  }): SessionUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      emailVerified: user.emailVerified,
      image: null,
    };
  }

  private hashSecret(value: string) {
    return createHmac("sha256", this.authSecret).update(value).digest("hex");
  }

  private generateOtp() {
    return randomInt(0, 1_000_000).toString().padStart(6, "0");
  }

  private generateResetToken() {
    return randomBytes(32).toString("base64url");
  }

  private minutesFromNow(minutes: number) {
    const date = new Date();
    date.setMinutes(date.getMinutes() + minutes);
    return date;
  }

  private isWithinCooldown(date: Date, cooldownSeconds: number) {
    return Date.now() - date.getTime() < cooldownSeconds * 1000;
  }
}
