import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { FastifyRequest } from "fastify";
import { UsersService } from "../users/users.service";
import type { JwtPayload } from "./auth.types";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
    @Inject(UsersService)
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: (req: FastifyRequest) => {
        let token: string | null = null;
        if (req && req.cookies) {
          token =
            (req.cookies as Record<string, string>)["access_token"] ?? null;
        }
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
