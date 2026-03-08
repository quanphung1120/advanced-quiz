ALTER TABLE "user"
ADD COLUMN IF NOT EXISTS "email_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "email_verified_at" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "password_changed_at" TIMESTAMP(3);

CREATE TABLE IF NOT EXISTS "email_otp" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "purpose" TEXT NOT NULL,
  "code_hash" TEXT NOT NULL,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "last_sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "email_otp_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "email_otp_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "email_otp_user_id_purpose_idx"
ON "email_otp" ("user_id", "purpose");

CREATE TABLE IF NOT EXISTS "password_reset_token" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "token_hash" TEXT NOT NULL,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "used_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "password_reset_token_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "password_reset_token_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "password_reset_token_token_hash_key"
ON "password_reset_token" ("token_hash");

CREATE INDEX IF NOT EXISTS "password_reset_token_user_id_expires_at_idx"
ON "password_reset_token" ("user_id", "expires_at");
