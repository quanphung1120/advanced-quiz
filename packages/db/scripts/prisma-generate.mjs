import { spawnSync } from "node:child_process";

const buildDatabaseUrl =
  "postgresql://postgres:postgres@localhost:5432/advanced_quiz?schema=public";

const env = { ...process.env };

if (!env.DATABASE_URL) {
  env.DATABASE_URL = buildDatabaseUrl;
  console.log(
    "[db:generate] DATABASE_URL is not set; using a build-only placeholder for Prisma client generation.",
  );
}

const result = spawnSync(
  "pnpm",
  ["exec", "prisma", "generate", "--config", "./prisma.config.ts"],
  {
    stdio: "inherit",
    env,
    shell: process.platform === "win32",
  },
);

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
