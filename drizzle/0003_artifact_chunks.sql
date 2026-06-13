CREATE EXTENSION IF NOT EXISTS vector;
--> statement-breakpoint
CREATE TABLE "artifact_chunk" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"artifact_id" uuid NOT NULL,
	"chunk_index" integer NOT NULL,
	"heading" text,
	"content" text NOT NULL,
	"hash" text NOT NULL,
	"embedding" vector(1536),
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "artifact_chunk" ADD CONSTRAINT "artifact_chunk_artifact_id_artifact_id_fk" FOREIGN KEY ("artifact_id") REFERENCES "public"."artifact"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "artifactChunk_artifactId_idx" ON "artifact_chunk" USING btree ("artifact_id");
--> statement-breakpoint
CREATE UNIQUE INDEX "artifactChunk_artifactId_heading_unique" ON "artifact_chunk" ("artifact_id", "heading") WHERE heading IS NOT NULL;
--> statement-breakpoint
CREATE INDEX "artifactChunk_embedding_idx" ON "artifact_chunk" USING hnsw ("embedding" vector_cosine_ops);
