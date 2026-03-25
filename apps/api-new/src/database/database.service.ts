import {
  Injectable,
  type OnApplicationShutdown,
  type OnModuleInit,
} from "@nestjs/common";
import { prisma, type DatabaseClient } from "@advanced-quiz/db";

@Injectable()
export class DatabaseService implements OnModuleInit, OnApplicationShutdown {
  readonly database: DatabaseClient = prisma;

  async onModuleInit() {
    await this.database.$connect();
  }

  async onApplicationShutdown() {
    await this.database.$disconnect();
  }
}
