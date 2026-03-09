CREATE TABLE "collection" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_public" boolean DEFAULT false NOT NULL,
	"owner_id" text NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "collection_collaborator" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"collection_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"role" text DEFAULT 'viewer' NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_otp" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"purpose" text NOT NULL,
	"code_hash" text NOT NULL,
	"expires_at" timestamp (3) NOT NULL,
	"last_sent_at" timestamp (3) DEFAULT now() NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "flashcard" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"type" text DEFAULT 'simple' NOT NULL,
	"collection_id" uuid NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "flashcard_review" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"flashcard_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"ease_factor" double precision DEFAULT 2.5 NOT NULL,
	"interval" integer DEFAULT 0 NOT NULL,
	"due_at" timestamp (3) DEFAULT now() NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"learning_step" integer DEFAULT 0 NOT NULL,
	"review_count" integer DEFAULT 0 NOT NULL,
	"lapse_count" integer DEFAULT 0 NOT NULL,
	"last_reviewed_at" timestamp (3),
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "password_reset_token" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp (3) NOT NULL,
	"used_at" timestamp (3),
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "refresh_token" (
	"id" text PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" timestamp (3) NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"email_verified_at" timestamp (3),
	"password_changed_at" timestamp (3),
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "collection" ADD CONSTRAINT "collection_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "collection_collaborator" ADD CONSTRAINT "collection_collaborator_collection_id_collection_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collection"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "collection_collaborator" ADD CONSTRAINT "collection_collaborator_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "email_otp" ADD CONSTRAINT "email_otp_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "flashcard" ADD CONSTRAINT "flashcard_collection_id_collection_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collection"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "flashcard" ADD CONSTRAINT "flashcard_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "flashcard_review" ADD CONSTRAINT "flashcard_review_flashcard_id_flashcard_id_fk" FOREIGN KEY ("flashcard_id") REFERENCES "public"."flashcard"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "flashcard_review" ADD CONSTRAINT "flashcard_review_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "password_reset_token" ADD CONSTRAINT "password_reset_token_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "refresh_token" ADD CONSTRAINT "refresh_token_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "collection_owner_id_idx" ON "collection" USING btree ("owner_id");--> statement-breakpoint
CREATE UNIQUE INDEX "collection_collaborator_unique_idx" ON "collection_collaborator" USING btree ("collection_id","user_id");--> statement-breakpoint
CREATE INDEX "collection_collaborator_user_id_idx" ON "collection_collaborator" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "email_otp_user_id_purpose_idx" ON "email_otp" USING btree ("user_id","purpose");--> statement-breakpoint
CREATE INDEX "flashcard_collection_id_idx" ON "flashcard" USING btree ("collection_id");--> statement-breakpoint
CREATE UNIQUE INDEX "flashcard_review_user_card_idx" ON "flashcard_review" USING btree ("user_id","flashcard_id");--> statement-breakpoint
CREATE INDEX "flashcard_review_flashcard_id_idx" ON "flashcard_review" USING btree ("flashcard_id");--> statement-breakpoint
CREATE INDEX "flashcard_review_due_idx" ON "flashcard_review" USING btree ("user_id","due_at");--> statement-breakpoint
CREATE INDEX "flashcard_review_status_idx" ON "flashcard_review" USING btree ("user_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "password_reset_token_token_hash_key" ON "password_reset_token" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "password_reset_token_user_id_expires_at_idx" ON "password_reset_token" USING btree ("user_id","expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "refresh_token_token_key" ON "refresh_token" USING btree ("token");--> statement-breakpoint
CREATE INDEX "refresh_token_user_id_idx" ON "refresh_token" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_email_key" ON "user" USING btree ("email");