import { Injectable, type OnApplicationShutdown } from "@nestjs/common";
import { db, pool } from "@advanced-quiz/db";

export const DATABASE = Symbol("DATABASE");

export const databaseProvider = {
  provide: DATABASE,
  useValue: db,
};

@Injectable()
export class DatabaseLifecycleService implements OnApplicationShutdown {
  async onApplicationShutdown() {
    await pool.end();
  }
}
