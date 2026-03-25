import { Module } from "@nestjs/common";
import { CollectionsModule } from "../collections/collections.module.js";
import { FlashcardsController } from "./flashcards.controller.js";

@Module({
  imports: [CollectionsModule],
  controllers: [FlashcardsController],
})
export class FlashcardsModule {}
