import type { SessionUser } from "@advanced-quiz/contracts";
import { JwtService } from "@nestjs/jwt";
import {
  UnauthorizedException,
} from "@nestjs/common";
import {
  createHmac,
  randomBytes,
  randomInt,
  timingSafeEqual,
} from "node:crypto";
import type { JwtPayload } from "./auth.types.js";

export type AuthSessionUser = {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
};

export function toSessionUser(user: AuthSessionUser): SessionUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    emailVerified: user.emailVerified,
    image: null,
  };
}

export function hashSecret(secret: string, value: string) {
  return createHmac("sha256", secret).update(value).digest("hex");
}

export function compareSecretHash(
  storedHash: string,
  candidateValue: string,
  secret: string,
) {
  const candidateHash = hashSecret(secret, candidateValue);

  return timingSafeEqual(
    Buffer.from(storedHash, "hex"),
    Buffer.from(candidateHash, "hex"),
  );
}

export function generateOtp() {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export function generateResetToken() {
  return randomBytes(32).toString("base64url");
}

export function minutesFromNow(minutes: number) {
  const date = new Date();
  date.setMinutes(date.getMinutes() + minutes);
  return date;
}

export function isWithinCooldown(date: Date, cooldownSeconds: number) {
  return Date.now() - date.getTime() < cooldownSeconds * 1000;
}

export function verifyRefreshToken(jwtService: JwtService, token: string) {
  try {
    const payload = jwtService.verify<JwtPayload>(token);

    if (payload.type !== "refresh") {
      throw new UnauthorizedException("Invalid refresh token");
    }

    return payload;
  } catch {
    throw new UnauthorizedException("Invalid refresh token");
  }
}
