import Fastify from "fastify";
import { corsPlugin } from "./plugins/cors";
import { cookiePlugin } from "./plugins/cookie";
import { swaggerPlugin } from "./plugins/swagger";
import { authPlugin } from "./plugins/auth";
import { healthRoutes } from "./routes/health";
import { authRoutes } from "./routes/auth";
import { collectionRoutes } from "./routes/collections";
import { flashcardRoutes } from "./routes/flashcards";
import { userRoutes } from "./routes/users";

const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST ?? "0.0.0.0";

async function main() {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL ?? "info",
      transport:
        process.env.NODE_ENV === "development"
          ? { target: "pino-pretty", options: { colorize: true } }
          : undefined,
    },
  });

  // ── Global plugins (order matters) ──────────────────────────────────────
  await app.register(corsPlugin);
  await app.register(cookiePlugin);
  await app.register(swaggerPlugin);
  await app.register(authPlugin);

  // ── Routes ──────────────────────────────────────────────────────────────
  await app.register(healthRoutes);
  await app.register(authRoutes, { prefix: "/api/auth" });
  await app.register(collectionRoutes, { prefix: "/api/v1/collections" });
  await app.register(flashcardRoutes, { prefix: "/api/v1/flashcards" });
  await app.register(userRoutes, { prefix: "/api/v1/users" });

  // ── Start ───────────────────────────────────────────────────────────────
  await app.ready();
  await app.listen({ port: PORT, host: HOST });
}

main().catch((err) => {
  console.error("Fatal error starting server:", err);
  process.exit(1);
});
