import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const globalForDb = globalThis as unknown as {
  db?: DatabaseClient;
  pool?: Pool;
};

const createPool = () =>
  new Pool({
    connectionString,
  });

const createDatabase = (pool: Pool) => drizzle(pool, { schema });

export type DatabaseClient = ReturnType<typeof createDatabase>;

export const pool = globalForDb.pool ?? createPool();
export const db = globalForDb.db ?? createDatabase(pool);

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
  globalForDb.db = db;
}
