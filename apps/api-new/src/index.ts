import "reflect-metadata";
import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import cookie from "@fastify/cookie";
import { AppModule } from "./app.module";

async function bootstrap() {
  const logger = new Logger("Bootstrap");

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  const configService = app.get(ConfigService);
  const nodeEnv = configService.getOrThrow<string>("NODE_ENV");
  const authSecret = configService.getOrThrow<string>("AUTH_SECRET");
  const corsOrigin = configService.getOrThrow<string>("CORS_ORIGIN");
  const apiUrl = configService.getOrThrow<string>("API_URL");
  const port = configService.getOrThrow<number>("PORT");

  await app.register(cookie as never, {
    secret: authSecret,
    parseOptions: {
      httpOnly: true,
      secure: nodeEnv === "production",
      sameSite: "lax",
      path: "/",
    },
  });

  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
  });

  const enableDocs =
    nodeEnv !== "production" || configService.get<boolean>("ENABLE_DOCS");

  if (enableDocs) {
    const config = new DocumentBuilder()
      .setTitle("Advanced Quiz API")
      .setDescription(
        "Flashcard and spaced-repetition API powered by NestJS, Fastify, and Drizzle ORM",
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
