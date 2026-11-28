CREATE TABLE "chat_thread" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "chat_message" DROP CONSTRAINT "chat_message_user_id_user_id_fk";
--> statement-breakpoint
DROP INDEX "chat_message_user_idx";--> statement-breakpoint
ALTER TABLE "chat_message" ADD COLUMN "thread_id" text;--> statement-breakpoint
INSERT INTO "chat_thread" ("id", "user_id", "title", "created_at", "updated_at") SELECT gen_random_uuid()::text, "user_id", 'Earlier conversation', min("created_at"), max("created_at") FROM "chat_message" GROUP BY "user_id";--> statement-breakpoint
UPDATE "chat_message" SET "thread_id" = "chat_thread"."id" FROM "chat_thread" WHERE "chat_thread"."user_id" = "chat_message"."user_id";--> statement-breakpoint
ALTER TABLE "chat_message" ALTER COLUMN "thread_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_thread" ADD CONSTRAINT "chat_thread_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "chat_thread_user_updated_idx" ON "chat_thread" USING btree ("user_id","updated_at");--> statement-breakpoint
ALTER TABLE "chat_message" ADD CONSTRAINT "chat_message_thread_id_chat_thread_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."chat_thread"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "chat_message_thread_idx" ON "chat_message" USING btree ("thread_id","position");--> statement-breakpoint
ALTER TABLE "chat_message" DROP COLUMN "user_id";