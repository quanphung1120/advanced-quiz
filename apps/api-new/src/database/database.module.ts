import { Global, Module } from "@nestjs/common";
import { databaseProvider, DatabaseLifecycleService } from "./database.service";

@Global()
@Module({
  providers: [databaseProvider, DatabaseLifecycleService],
  exports: [databaseProvider],
})
export class DatabaseModule {}
