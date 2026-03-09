import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService, type ConfigType } from "@nestjs/config";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { AuthGuard } from "./auth.guard";
import { AuthMailerService } from "./auth.mailer";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./jwt.strategy";
import { DatabaseModule } from "../database/database.module";
import { UsersModule } from "../users/users.module";

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>("AUTH_SECRET"),
      }),
      inject: [ConfigService],
    }),
    DatabaseModule,
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, JwtStrategy, AuthMailerService],
  exports: [AuthService, AuthGuard],
})
export class AuthModule { }
