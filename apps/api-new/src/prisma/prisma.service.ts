import {
  Inject,
  Injectable,
  type OnModuleDestroy,
  type OnModuleInit,
} from "@nestjs/common";
import { prisma, PrismaClient } from "@advanced-quiz/db";

export abstract class PrismaService extends PrismaClient {}

export const prismaProvider = {
  provide: PrismaService,
  useValue: prisma,
};

@Injectable()
export class PrismaLifecycleService implements OnModuleInit, OnModuleDestroy {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.prisma.$connect();
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }
}
