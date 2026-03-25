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
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import type {
  ForgotPasswordBody,
  RegisterResponse,
  ResetPasswordBody,
  ResendVerificationBody,
  SignInBody,
  SignInResponse,
  SignUpBody,
  VerifyEmailBody,
} from "@advanced-quiz/contracts";
import * as bcrypt from "bcrypt";
import { DatabaseService } from "../database/database.service.js";
import { UsersService } from "../users/users.service.js";
import { AuthMailerService } from "./auth.mailer.js";
import type { JwtPayload } from "./auth.types.js";
import {
  ACCESS_TOKEN_TTL_SECONDS,
  EMAIL_OTP_EXPIRY_MINUTES,
  EMAIL_OTP_RESEND_COOLDOWN_SECONDS,
  MAX_OTP_ATTEMPTS,
  PASSWORD_RESET_EXPIRY_MINUTES,
  PASSWORD_RESET_RESEND_COOLDOWN_SECONDS,
  REFRESH_TOKEN_TTL,
} from "./auth.constants.js";
import {
  compareSecretHash,
  generateOtp,
  generateResetToken,
  hashSecret,
  isWithinCooldown,
  minutesFromNow,
  toSessionUser,
  type AuthSessionUser,
  verifyRefreshToken,
} from "./auth.utils.js";

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class AuthService {
  private readonly authSecret: string;
  private readonly webUrl: string;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @Inject(DatabaseService)
    private readonly databaseService: DatabaseService,
    private readonly authMailerService: AuthMailerService,
    private readonly configService: ConfigService,
  ) {
    this.authSecret = this.configService.getOrThrow<string>("AUTH_SECRET");
    this.webUrl = this.configService.getOrThrow<string>("WEB_URL");
  }

  private get database() {
    return this.databaseService.database;
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
        // Best effort; proceed with the verification-required error either way.
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

    const otpRecord = await this.database.emailOtp.findFirst({
      where: {
        userId: user.id,
        purpose: "email_verification",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const now = new Date();

    if (!otpRecord || otpRecord.expiresAt <= now) {
      throw new BadRequestException("Invalid or expired verification code");
    }

    const hashesMatch = compareSecretHash(
      otpRecord.codeHash,
      data.otp,
      this.authSecret,
    );

    if (!hashesMatch) {
      const updated = await this.database.emailOtp.update({
        where: { id: otpRecord.id },
        data: {
          attempts: {
            increment: 1,
          },
        },
        select: {
          attempts: true,
        },
      });

      if (updated.attempts >= MAX_OTP_ATTEMPTS) {
        await this.database.emailOtp.deleteMany({
          where: {
            userId: user.id,
            purpose: "email_verification",
          },
        });
      }

      throw new BadRequestException("Invalid or expired verification code");
    }

    const verifiedUser = await this.database.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          emailVerifiedAt: now,
        },
      });

      await tx.emailOtp.deleteMany({
        where: {
          userId: user.id,
          purpose: "email_verification",
        },
      });

      return updatedUser;
    });

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

    const existingOtp = await this.database.emailOtp.findFirst({
      where: {
        userId: user.id,
        purpose: "email_verification",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (
      existingOtp &&
      isWithinCooldown(
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

    const existingToken = await this.database.passwordResetToken.findFirst({
      where: {
        userId: user.id,
        usedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (
      existingToken &&
      isWithinCooldown(
        existingToken.createdAt,
        PASSWORD_RESET_RESEND_COOLDOWN_SECONDS,
      )
    ) {
      return {
        message:
          "If an account exists for that email, password reset instructions have been sent",
      };
    }

    await this.database.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
      },
    });

    const resetToken = generateResetToken();
    const resetTokenHash = hashSecret(this.authSecret, resetToken);
    const expiresAt = minutesFromNow(PASSWORD_RESET_EXPIRY_MINUTES);

    await this.database.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: resetTokenHash,
        expiresAt,
      },
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
      await this.database.passwordResetToken.deleteMany({
        where: {
          userId: user.id,
          tokenHash: resetTokenHash,
        },
      });
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
    const tokenHash = hashSecret(this.authSecret, data.token);
    const now = new Date();

    const resetRecord = await this.database.passwordResetToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: {
          gt: now,
        },
      },
    });

    if (!resetRecord) {
      throw new BadRequestException("Invalid or expired password reset link");
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    await this.database.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: resetRecord.userId },
        data: {
          password: passwordHash,
          passwordChangedAt: now,
        },
      });

      await tx.passwordResetToken.deleteMany({
        where: { userId: resetRecord.userId },
      });

      await tx.refreshToken.deleteMany({
        where: { userId: resetRecord.userId },
      });
    });

    return {
      message: "Password reset successful. Sign in with your new password",
    };
  }

  async refreshSession(refreshToken: string) {
    const payload = verifyRefreshToken(this.jwtService, refreshToken);

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
    const existingOtp = await this.database.emailOtp.findFirst({
      where: {
        userId: user.id,
        purpose: "email_verification",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (
      existingOtp &&
      isWithinCooldown(
        existingOtp.lastSentAt,
        EMAIL_OTP_RESEND_COOLDOWN_SECONDS,
      )
    ) {
      throw new HttpException(
        "Please wait before requesting another verification code",
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const otp = generateOtp();
    const codeHash = hashSecret(this.authSecret, otp);
    const expiresAt = minutesFromNow(EMAIL_OTP_EXPIRY_MINUTES);

    await this.database.emailOtp.deleteMany({
      where: {
        userId: user.id,
        purpose: "email_verification",
      },
    });

    const otpRecord = await this.database.emailOtp.create({
      data: {
        userId: user.id,
        purpose: "email_verification",
        codeHash,
        expiresAt,
      },
      select: {
        id: true,
      },
    });

    try {
      await this.authMailerService.sendVerificationOtp({
        to: user.email,
        name: user.name,
        otp,
        expiresInMinutes: EMAIL_OTP_EXPIRY_MINUTES,
        idempotencyKey: `email-otp:${otpRecord.id}`,
      });
    } catch {
      await this.database.emailOtp.deleteMany({
        where: { id: otpRecord.id },
      });
      throw new InternalServerErrorException(
        "Unable to send verification email",
      );
    }
  }

  private async createAuthenticatedSession(
    user: AuthSessionUser,
  ): Promise<SignInResponse & AuthTokens> {
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
      user: toSessionUser(user),
    };
  }
}
