ALTER TYPE "public"."document_status" ADD VALUE 'drafting' BEFORE 'draft';--> statement-breakpoint
CREATE TABLE "document_brief" (
	"document_id" text PRIMARY KEY NOT NULL,
	"prompt" text NOT NULL,
	"outline" text DEFAULT 'auto' NOT NULL,
	"questions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"answers" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"advice" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "document" ADD COLUMN "type" text;--> statement-breakpoint
ALTER TABLE "document_brief" ADD CONSTRAINT "document_brief_document_id_document_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."document"("id") ON DELETE cascade ON UPDATE no action;