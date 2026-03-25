import { type ConfigService } from "@nestjs/config";

export function buildCorsOptions(configService: ConfigService) {
  return {
    origin: configService.getOrThrow<string>("CORS_ORIGIN"),
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
  };
}
