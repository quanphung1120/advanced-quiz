import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthController } from "./auth.controller.js";
import { AuthGuard } from "./auth.guard.js";
import { AuthMailerService } from "./auth.mailer.js";
import { AuthService } from "./auth.service.js";
import { JwtStrategy } from "./jwt.strategy.js";
import { DatabaseModule } from "../database/database.module.js";
import { UsersModule } from "../users/users.module.js";

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>("AUTH_SECRET"),
      }),
    }),
    DatabaseModule,
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, JwtStrategy, AuthMailerService],
  exports: [AuthService, AuthGuard],
})
export class AuthModule {}
