import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { serverEnvSchema } from "@advanced-quiz/config/server";
import { AuthModule } from "./auth/auth.module";
import { CollectionsModule } from "./collections/collections.module";
import { DatabaseModule } from "./database/database.module";
import { FlashcardsModule } from "./flashcards/flashcards.module";
import { HealthModule } from "./health/health.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
      validate: (config) => serverEnvSchema.parse(config),
    }),
    DatabaseModule,
    AuthModule,
    HealthModule,
    CollectionsModule,
    FlashcardsModule,
    UsersModule,
  ],
})
export class AppModule { }
