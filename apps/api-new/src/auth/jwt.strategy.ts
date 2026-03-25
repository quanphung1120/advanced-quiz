import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Request } from "express";
import { UsersService } from "../users/users.service.js";
import type { JwtPayload } from "./auth.types.js";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @Inject(UsersService)
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: (req: Request) => {
        const token = req?.cookies?.["access_token"] ?? null;
        return token ?? ExtractJwt.fromAuthHeaderAsBearerToken()(req as never);
      },
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>("AUTH_SECRET"),
    });
  }

  async validate(payload: JwtPayload) {
    if (payload.type !== "access") {
      throw new UnauthorizedException();
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      image: null,
    };
  }
}
