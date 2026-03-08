import { Global, Module } from "@nestjs/common";
import {
  PrismaLifecycleService,
  prismaProvider,
  PrismaService,
} from "./prisma.service";

@Global()
@Module({
  providers: [prismaProvider, PrismaLifecycleService],
  exports: [PrismaService],
})
export class PrismaModule {}
