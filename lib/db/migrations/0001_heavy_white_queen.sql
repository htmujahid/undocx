CREATE TYPE "public"."rule_kind" AS ENUM('spelling', 'banned_word', 'format', 'custom');--> statement-breakpoint
CREATE TABLE "rule" (
	"id" text PRIMARY KEY NOT NULL,
	"rule_set_id" text NOT NULL,
	"kind" "rule_kind" NOT NULL,
	"value" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rule_set" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "voice" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"summary" jsonb,
	"summarized_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "voice_sample" (
	"id" text PRIMARY KEY NOT NULL,
	"voice_id" text NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"word_count" integer NOT NULL,
	"is_included" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "writer_profile" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"role" text DEFAULT '' NOT NULL,
	"organization" text DEFAULT '' NOT NULL,
	"industry" text DEFAULT '' NOT NULL,
	"about" text DEFAULT '' NOT NULL,
	"region" text,
	"first_language" text,
	"writing_language" text,
	"currency" text,
	"units" text,
	"date_format" text,
	"audience" text DEFAULT '' NOT NULL,
	"audience_level" text,
	"facts" text DEFAULT '' NOT NULL,
	"signoff" text DEFAULT '' NOT NULL,
	"contact" text DEFAULT '' NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "rule" ADD CONSTRAINT "rule_rule_set_id_rule_set_id_fk" FOREIGN KEY ("rule_set_id") REFERENCES "public"."rule_set"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rule_set" ADD CONSTRAINT "rule_set_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice" ADD CONSTRAINT "voice_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_sample" ADD CONSTRAINT "voice_sample_voice_id_voice_id_fk" FOREIGN KEY ("voice_id") REFERENCES "public"."voice"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "writer_profile" ADD CONSTRAINT "writer_profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "rule_rule_set_idx" ON "rule" USING btree ("rule_set_id");--> statement-breakpoint
CREATE UNIQUE INDEX "rule_spelling_idx" ON "rule" USING btree ("rule_set_id") WHERE "rule"."kind" = 'spelling';--> statement-breakpoint
CREATE INDEX "rule_set_user_idx" ON "rule_set" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "voice_user_idx" ON "voice" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "voice_sample_voice_idx" ON "voice_sample" USING btree ("voice_id");--> statement-breakpoint
CREATE INDEX "writer_profile_user_idx" ON "writer_profile" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "writer_profile_default_idx" ON "writer_profile" USING btree ("user_id") WHERE "writer_profile"."is_default";