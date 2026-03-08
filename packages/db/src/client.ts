import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { PrismaClient } from "../generated/prisma/client";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

type GlobalForPrisma = typeof globalThis & {
  prisma?: PrismaClient;
};

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to initialize Prisma");
}

const pool = new Pool({
  connectionString,
  connectionTimeoutMillis: 10000,
});

const globalForPrisma = globalThis as GlobalForPrisma;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaNeon(pool),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
