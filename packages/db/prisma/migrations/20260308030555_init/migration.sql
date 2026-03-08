-- DropForeignKey
ALTER TABLE "account" DROP CONSTRAINT "account_user_id_user_id_fk";

-- DropForeignKey
ALTER TABLE "collection" DROP CONSTRAINT "collection_owner_id_user_id_fk";

-- DropForeignKey
ALTER TABLE "collection_collaborator" DROP CONSTRAINT "collection_collaborator_collection_id_collection_id_fk";

-- DropForeignKey
ALTER TABLE "collection_collaborator" DROP CONSTRAINT "collection_collaborator_user_id_user_id_fk";

-- DropForeignKey
ALTER TABLE "flashcard" DROP CONSTRAINT "flashcard_collection_id_collection_id_fk";

-- DropForeignKey
ALTER TABLE "flashcard" DROP CONSTRAINT "flashcard_created_by_user_id_fk";

-- DropForeignKey
ALTER TABLE "flashcard_review" DROP CONSTRAINT "flashcard_review_flashcard_id_flashcard_id_fk";

-- DropForeignKey
ALTER TABLE "flashcard_review" DROP CONSTRAINT "flashcard_review_user_id_user_id_fk";

-- DropForeignKey
ALTER TABLE "session" DROP CONSTRAINT "session_user_id_user_id_fk";

-- AlterTable
ALTER TABLE "account" ALTER COLUMN "access_token_expires_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "refresh_token_expires_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" DROP DEFAULT,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "collection" ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" DROP DEFAULT,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "collection_collaborator" ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "flashcard" ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" DROP DEFAULT,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "flashcard_review" ALTER COLUMN "due_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "last_reviewed_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" DROP DEFAULT,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "session" ALTER COLUMN "expires_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" DROP DEFAULT,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" DROP DEFAULT,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "verification" ALTER COLUMN "expires_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection" ADD CONSTRAINT "collection_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_collaborator" ADD CONSTRAINT "collection_collaborator_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_collaborator" ADD CONSTRAINT "collection_collaborator_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flashcard" ADD CONSTRAINT "flashcard_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flashcard" ADD CONSTRAINT "flashcard_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flashcard_review" ADD CONSTRAINT "flashcard_review_flashcard_id_fkey" FOREIGN KEY ("flashcard_id") REFERENCES "flashcard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flashcard_review" ADD CONSTRAINT "flashcard_review_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "session_token_unique" RENAME TO "session_token_key";

-- RenameIndex
ALTER INDEX "user_email_unique" RENAME TO "user_email_key";
