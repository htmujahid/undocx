DROP TABLE "index_job" CASCADE;--> statement-breakpoint
ALTER TABLE "document" ADD COLUMN "indexed_version" integer;--> statement-breakpoint
ALTER TABLE "document" ADD COLUMN "indexed_hash" text;--> statement-breakpoint
ALTER TABLE "document" ADD COLUMN "indexed_at" timestamp;