import "reflect-metadata";
import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module.js";
import { buildCorsOptions } from "./config/cors.config.js";

async function bootstrap() {
  const logger = new Logger("Bootstrap");

  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const apiUrl = configService.getOrThrow<string>("API_URL");
  const authSecret = configService.getOrThrow<string>("AUTH_SECRET");
  const enableDocs = configService.getOrThrow<boolean>("ENABLE_DOCS");
  const nodeEnv = configService.getOrThrow<string>("NODE_ENV");
  const port = configService.getOrThrow<number>("PORT");

  app.use(cookieParser(authSecret));
  app.enableCors(buildCorsOptions(configService));

  if (nodeEnv !== "production" || enableDocs) {
    const config = new DocumentBuilder()
      .setTitle("Advanced Quiz API")
      .setDescription(
        "Flashcard and spaced-repetition API powered by NestJS, Express, and Prisma ORM",
      )
      .setVersion("0.1.0")
      .addServer(
        apiUrl,
        nodeEnv === "production" ? "Production" : "Development",
      )
      .addCookieAuth("access_token", {
        type: "apiKey",
        in: "cookie",
        name: "access_token",
        description: "JWT access token cookie",
      })
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("docs", app, document);
  }

  await app.listen(port, "0.0.0.0");
  logger.log(`API listening on ${apiUrl}`);
}

bootstrap().catch((error: unknown) => {
  const logger = new Logger("Bootstrap");
  if (error instanceof Error) {
    logger.error(`Fatal error starting server: ${error.message}`, error.stack);
  } else {
    logger.error("Fatal error starting server", String(error));
  }
  process.exit(1);
});
