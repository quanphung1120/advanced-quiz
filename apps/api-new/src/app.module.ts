import { Module } from "@nestjs/common";
import { AIModule } from "./ai/ai.module.js";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module.js";
import { CollectionsModule } from "./collections/collections.module.js";
import { serverEnvSchema } from "./config/server-env.js";
import { DatabaseModule } from "./database/database.module.js";
import { FlashcardsModule } from "./flashcards/flashcards.module.js";
import { HealthModule } from "./health/health.module.js";
import { UsersModule } from "./users/users.module.js";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
      validate: (config) => serverEnvSchema.parse(config),
    }),
    DatabaseModule,
    AIModule,
    AuthModule,
    HealthModule,
    CollectionsModule,
    FlashcardsModule,
    UsersModule,
  ],
})
export class AppModule {}
