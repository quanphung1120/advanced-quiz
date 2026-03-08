import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import * as bcrypt from "bcrypt";

const PASSWORD_SALT_ROUNDS = 12;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async create(data: { email: string; name: string; password?: string }) {
    const hashedPassword = data.password
      ? await bcrypt.hash(data.password, PASSWORD_SALT_ROUNDS)
      : undefined;

    return this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword ?? "",
        emailVerified: false,
      },
    });
  }

  async findPasswordByUserId(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });
    return user?.password;
  }

  async updateRefreshToken(userId: string, refreshToken: string | null) {
    if (refreshToken === null) {
      await this.prisma.refreshToken.deleteMany({
        where: { userId },
      });
      return;
    }

    const hashedToken = await bcrypt.hash(refreshToken, PASSWORD_SALT_ROUNDS);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.prisma.refreshToken.create({
      data: {
        token: hashedToken,
        userId: userId,
        expiresAt: expiresAt,
      },
    });
  }

  async validateRefreshToken(userId: string, refreshToken: string) {
    const tokens = await this.prisma.refreshToken.findMany({
      where: {
        userId,
        expiresAt: { gt: new Date() },
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
    await this.prisma.refreshToken.delete({
      where: { id: tokenId },
    });
  }

  async searchUserEmails(query: string, currentUserId: string) {
    const users = await this.prisma.user.findMany({
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
    });

    return users.map((user) => user.email);
  }
}
