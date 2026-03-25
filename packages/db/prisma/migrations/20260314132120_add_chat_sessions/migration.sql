-- CreateTable
CREATE TABLE "chat_session" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'New chat',
    "preview" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_message" (
    "id" TEXT NOT NULL,
    "session_id" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "text_content" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "chat_session_user_id_updated_at_idx" ON "chat_session"("user_id", "updated_at");

-- CreateIndex
CREATE INDEX "chat_message_session_id_idx" ON "chat_message"("session_id");

-- CreateIndex
CREATE UNIQUE INDEX "chat_message_session_id_position_key" ON "chat_message"("session_id", "position");

-- AddForeignKey
ALTER TABLE "chat_session" ADD CONSTRAINT "chat_session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_message" ADD CONSTRAINT "chat_message_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "chat_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;
