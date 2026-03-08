import { SQL } from "bun";
import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  lte,
  or,
} from "drizzle-orm";
import { drizzle } from "drizzle-orm/bun-sql";
import * as schema from "./schema";

const client = new SQL(process.env.DATABASE_URL!);

export const db = drizzle({ client, schema });

export { and, asc, count, desc, eq, ilike, inArray, lte, or, schema };
