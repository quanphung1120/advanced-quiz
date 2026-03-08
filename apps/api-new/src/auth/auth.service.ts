import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
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
  SessionUser,
  SignInBody,
  SignInResponse,
  SignUpBody,
  VerifyEmailBody,
} from "@advanced-quiz/contracts";
import * as bcrypt from "bcrypt";
import { createHmac, randomBytes, randomInt } from "node:crypto";
import { PrismaService } from "../prisma/prisma.service";
import { UsersService } from "../users/users.service";
import { AuthMailerService } from "./auth.mailer";

const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
const REFRESH_TOKEN_TTL = "7d";
const EMAIL_OTP_EXPIRY_MINUTES = 10;
const PASSWORD_RESET_EXPIRY_MINUTES = 30;
const EMAIL_OTP_RESEND_COOLDOWN_SECONDS = 60;
const PASSWORD_RESET_RESEND_COOLDOWN_SECONDS = 60;
const MAX_OTP_ATTEMPTS = 5;

type JwtPayload = {
  sub: string;
  email: string;
  emailVerified: boolean;
  type: "access" | "refresh";
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly authMailerService: AuthMailerService,
    private readonly configService: ConfigService,
  ) { }

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
    const user = await this.usersService.findByEmail(data.email);

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException("Invalid credentials");
    }

    if (!user.emailVerified) {
      await this.resendVerification({ email: user.email });
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

    const otpRecord = await this.prisma.emailOtp.findFirst({
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

    const codeHash = this.hashSecret(data.otp);
    if (otpRecord.codeHash !== codeHash) {
      const attempts = otpRecord.attempts + 1;

      if (attempts >= MAX_OTP_ATTEMPTS) {
        await this.prisma.emailOtp.deleteMany({
          where: {
            userId: user.id,
            purpose: "email_verification",
          },
        });
      } else {
        await this.prisma.emailOtp.update({
          where: { id: otpRecord.id },
          data: { attempts },
        });
      }

      throw new BadRequestException("Invalid or expired verification code");
    }

    const verifiedUser = await this.prisma.$transaction(async (tx) => {
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

    const existingOtp = await this.prisma.emailOtp.findFirst({
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

    const existingToken = await this.prisma.passwordResetToken.findFirst({
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

    await this.prisma.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
      },
    });

    const resetToken = this.generateResetToken();
    const resetTokenHash = this.hashSecret(resetToken);
    const expiresAt = this.minutesFromNow(PASSWORD_RESET_EXPIRY_MINUTES);

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: resetTokenHash,
        expiresAt,
      },
    });

    const resetUrl = new URL(
      "/reset-password",
      this.configService.getOrThrow<string>("WEB_URL"),
    );
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
      await this.prisma.passwordResetToken.deleteMany({
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
    const tokenHash = this.hashSecret(data.token);
    const resetRecord = await this.prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });

    if (!resetRecord) {
      throw new BadRequestException("Invalid or expired password reset link");
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: resetRecord.userId },
        data: {
          password: passwordHash,
          passwordChangedAt: new Date(),
        },
      });

      await tx.passwordResetToken.update({
        where: { id: resetRecord.id },
        data: {
          usedAt: new Date(),
        },
      });

      await tx.passwordResetToken.deleteMany({
        where: {
          userId: resetRecord.userId,
          id: {
            not: resetRecord.id,
          },
        },
      });

      await tx.refreshToken.deleteMany({
        where: {
          userId: resetRecord.userId,
        },
      });
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
    await this.usersService.updateRefreshToken(userId, null);
  }

  private async issueEmailVerificationOtp(user: {
    id: string;
    email: string;
    name: string;
  }) {
    const existingOtp = await this.prisma.emailOtp.findFirst({
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
      this.isWithinCooldown(
        existingOtp.lastSentAt,
        EMAIL_OTP_RESEND_COOLDOWN_SECONDS,
      )
    ) {
      throw new HttpException(
        "Please wait before requesting another verification code",
        429,
      );
    }

    const otp = this.generateOtp();
    const codeHash = this.hashSecret(otp);
    const expiresAt = this.minutesFromNow(EMAIL_OTP_EXPIRY_MINUTES);

    await this.prisma.emailOtp.deleteMany({
      where: {
        userId: user.id,
        purpose: "email_verification",
      },
    });

    const otpRecord = await this.prisma.emailOtp.create({
      data: {
        userId: user.id,
        purpose: "email_verification",
        codeHash,
        expiresAt,
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
      await this.prisma.emailOtp.delete({
        where: { id: otpRecord.id },
      });
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

    await this.usersService.updateRefreshToken(user.id, refreshToken);

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
    return createHmac(
      "sha256",
      this.configService.getOrThrow<string>("AUTH_SECRET"),
    )
      .update(value)
      .digest("hex");
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

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};
