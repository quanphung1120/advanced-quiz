import { Injectable, InternalServerErrorException } from "@nestjs/common";
import type { Prisma } from "@advanced-quiz/db";
import * as bcrypt from "bcrypt";
import { DatabaseService } from "../database/database.service.js";

const PASSWORD_SALT_ROUNDS = 12;
const REFRESH_TOKEN_TTL_DAYS = 7;

const USER_PUBLIC_SELECT = {
  id: true,
  name: true,
  email: true,
  emailVerified: true,
  emailVerifiedAt: true,
  passwordChangedAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersService {
  constructor(private readonly databaseService: DatabaseService) {}

  private get database() {
    return this.databaseService.database;
  }

  async findByEmail(email: string) {
    return this.database.user.findUnique({
      where: { email },
      select: USER_PUBLIC_SELECT,
    });
  }

  /** Returns the full user row including hashed password — only for auth use. */
  async findByEmailWithPassword(email: string) {
    return this.database.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    return this.database.user.findUnique({
      where: { id },
      select: USER_PUBLIC_SELECT,
    });
  }

  async create(data: { email: string; name: string; password?: string }) {
    const hashedPassword = data.password
      ? await bcrypt.hash(data.password, PASSWORD_SALT_ROUNDS)
      : undefined;

    const createdUser = await this.database.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword ?? "",
        emailVerified: false,
      },
      select: USER_PUBLIC_SELECT,
    });

    if (!createdUser) {
      throw new InternalServerErrorException("Unable to create user");
    }

    return createdUser;
  }

  async storeRefreshToken(userId: string, refreshToken: string) {
    const hashedToken = await bcrypt.hash(refreshToken, PASSWORD_SALT_ROUNDS);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_TTL_DAYS);

    // Replace all existing tokens to prevent unbounded accumulation.
    await this.database.refreshToken.deleteMany({
      where: { userId },
    });
    await this.database.refreshToken.create({
      data: {
        token: hashedToken,
        userId,
        expiresAt,
      },
    });
  }

  async deleteAllRefreshTokens(userId: string) {
    await this.database.refreshToken.deleteMany({
      where: { userId },
    });
  }

  async validateRefreshToken(userId: string, refreshToken: string) {
    const tokens = await this.database.refreshToken.findMany({
      where: {
        userId,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    for (const token of tokens) {
      const isMatch = await bcrypt.compare(refreshToken, token.token);
      if (isMatch) {
        return token;
      }
    }

    return null;
  }

  async deleteRefreshToken(tokenId: string) {
    await this.database.refreshToken.deleteMany({
      where: { id: tokenId },
    });
  }

  async searchUserEmails(query: string, currentUserId: string) {
    if (query.length < 3) {
      return [];
    }

    const rows = await this.database.user.findMany({
      where: {
        email: {
          contains: query,
          mode: "insensitive",
        },
        NOT: {
          id: currentUserId,
        },
      },
      orderBy: {
        email: "asc",
      },
      take: 10,
      select: {
        email: true,
      },
    });

    return rows.map((user) => user.email);
  }
}
