CREATE EXTENSION IF NOT EXISTS vector;--> statement-breakpoint
CREATE TABLE "chat_message" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"position" integer NOT NULL,
	"role" text NOT NULL,
	"parts" jsonb NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "document_chunk" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"document_id" text NOT NULL,
	"position" integer NOT NULL,
	"block_start" integer NOT NULL,
	"block_end" integer NOT NULL,
	"heading_path" text DEFAULT '' NOT NULL,
	"text" text NOT NULL,
	"content_hash" text NOT NULL,
	"embedding" halfvec(1536) NOT NULL,
	"embedding_model" text NOT NULL,
	"tsv" "tsvector" GENERATED ALWAYS AS (to_tsvector('english', "text")) STORED,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "index_job" (
	"document_id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"requested_at" timestamp DEFAULT now() NOT NULL,
	"locked_at" timestamp,
	"attempts" integer DEFAULT 0 NOT NULL,
	"error" text
);
--> statement-breakpoint
ALTER TABLE "chat_message" ADD CONSTRAINT "chat_message_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_chunk" ADD CONSTRAINT "document_chunk_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_chunk" ADD CONSTRAINT "document_chunk_document_id_document_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."document"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "index_job" ADD CONSTRAINT "index_job_document_id_document_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."document"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "index_job" ADD CONSTRAINT "index_job_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "chat_message_user_idx" ON "chat_message" USING btree ("user_id","position");--> statement-breakpoint
CREATE INDEX "document_chunk_user_idx" ON "document_chunk" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "document_chunk_position_idx" ON "document_chunk" USING btree ("document_id","position");--> statement-breakpoint
CREATE INDEX "document_chunk_tsv_idx" ON "document_chunk" USING gin ("tsv");--> statement-breakpoint
CREATE INDEX "index_job_requested_idx" ON "index_job" USING btree ("requested_at");