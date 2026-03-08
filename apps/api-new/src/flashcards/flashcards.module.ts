import { Module } from "@nestjs/common";
import { CollectionsModule } from "../collections/collections.module";
import { FlashcardsController } from "./flashcards.controller";

@Module({
  imports: [CollectionsModule],
  controllers: [FlashcardsController],
})
export class FlashcardsModule {}
