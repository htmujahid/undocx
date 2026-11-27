CREATE TYPE "public"."document_status" AS ENUM('draft', 'ready');--> statement-breakpoint
CREATE TABLE "document" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text DEFAULT 'Untitled document' NOT NULL,
	"status" "document_status" DEFAULT 'draft' NOT NULL,
	"profile_id" text,
	"voice_id" text,
	"rule_set_id" text,
	"content" jsonb,
	"content_version" integer DEFAULT 0 NOT NULL,
	"plain_text" text DEFAULT '' NOT NULL,
	"word_count" integer DEFAULT 0 NOT NULL,
	"locked_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "document" ADD CONSTRAINT "document_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document" ADD CONSTRAINT "document_profile_id_writer_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."writer_profile"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document" ADD CONSTRAINT "document_voice_id_voice_id_fk" FOREIGN KEY ("voice_id") REFERENCES "public"."voice"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document" ADD CONSTRAINT "document_rule_set_id_rule_set_id_fk" FOREIGN KEY ("rule_set_id") REFERENCES "public"."rule_set"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "document_user_updated_idx" ON "document" USING btree ("user_id","updated_at");