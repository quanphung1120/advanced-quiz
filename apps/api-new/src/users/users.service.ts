import { Inject, Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import * as bcrypt from "bcrypt";
import { and, asc, eq, gt, ilike, ne } from "drizzle-orm";
import { type DatabaseClient, refreshTokens, users } from "@advanced-quiz/db";
import { DATABASE } from "../database/database.service";

const PASSWORD_SALT_ROUNDS = 12;
const REFRESH_TOKEN_TTL_DAYS = 7;

const USER_PUBLIC_SELECT = {
  id: users.id,
  name: users.name,
  email: users.email,
  emailVerified: users.emailVerified,
  emailVerifiedAt: users.emailVerifiedAt,
  passwordChangedAt: users.passwordChangedAt,
  createdAt: users.createdAt,
  updatedAt: users.updatedAt,
} as const;

@Injectable()
export class UsersService {
  constructor(@Inject(DATABASE) private readonly database: DatabaseClient) {}

  async findByEmail(email: string) {
    const [user] = await this.database
      .select(USER_PUBLIC_SELECT)
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return user ?? null;
  }

  /** Returns the full user row including hashed password — only for auth use. */
  async findByEmailWithPassword(email: string) {
    return this.database.query.users.findFirst({
      where: eq(users.email, email),
    });
  }

  async findById(id: string) {
    const [user] = await this.database
      .select(USER_PUBLIC_SELECT)
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return user ?? null;
  }

  async create(data: { email: string; name: string; password?: string }) {
    const hashedPassword = data.password
      ? await bcrypt.hash(data.password, PASSWORD_SALT_ROUNDS)
      : undefined;

    const [createdUser] = await this.database
      .insert(users)
      .values({
        id: randomUUID(),
        email: data.email,
        name: data.name,
        password: hashedPassword ?? "",
        emailVerified: false,
      })
      .returning(USER_PUBLIC_SELECT);

    return createdUser;
  }

  async storeRefreshToken(userId: string, refreshToken: string) {
    const hashedToken = await bcrypt.hash(refreshToken, PASSWORD_SALT_ROUNDS);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_TTL_DAYS);

    // Replace all existing tokens to prevent unbounded accumulation.
    await this.database
      .delete(refreshTokens)
      .where(eq(refreshTokens.userId, userId));
    await this.database.insert(refreshTokens).values({
      id: randomUUID(),
      token: hashedToken,
      userId,
      expiresAt,
    });
  }

  async deleteAllRefreshTokens(userId: string) {
    await this.database
      .delete(refreshTokens)
      .where(eq(refreshTokens.userId, userId));
  }

  async validateRefreshToken(userId: string, refreshToken: string) {
    const tokens = await this.database
      .select()
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.userId, userId),
          gt(refreshTokens.expiresAt, new Date()),
        ),
      );

    for (const token of tokens) {
      const isMatch = await bcrypt.compare(refreshToken, token.token);
      if (isMatch) {
        return token;
      }
    }
    return null;
  }

  async deleteRefreshToken(tokenId: string) {
    await this.database
      .delete(refreshTokens)
      .where(eq(refreshTokens.id, tokenId));
  }

  async searchUserEmails(query: string, currentUserId: string) {
    if (query.length < 3) {
      return [];
    }

    const rows = await this.database
      .select({ email: users.email })
      .from(users)
      .where(and(ilike(users.email, `%${query}%`), ne(users.id, currentUserId)))
      .orderBy(asc(users.email))
      .limit(10);

    return rows.map((user) => user.email);
  }
}
