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
CREATE TABLE "notification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"actor_id" text,
	"workspace_id" uuid,
	"artifact_id" uuid,
	"data" jsonb NOT NULL,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "artifact" ADD COLUMN "owner_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "artifact_chunk" ADD CONSTRAINT "artifact_chunk_artifact_id_artifact_id_fk" FOREIGN KEY ("artifact_id") REFERENCES "public"."artifact"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_actor_id_user_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_artifact_id_artifact_id_fk" FOREIGN KEY ("artifact_id") REFERENCES "public"."artifact"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "artifactChunk_artifactId_idx" ON "artifact_chunk" USING btree ("artifact_id");--> statement-breakpoint
CREATE UNIQUE INDEX "artifactChunk_artifactId_heading_unique" ON "artifact_chunk" USING btree ("artifact_id","heading") WHERE heading IS NOT NULL;--> statement-breakpoint
CREATE INDEX "notification_userId_createdAt_idx" ON "notification" USING btree ("user_id","created_at");--> statement-breakpoint
ALTER TABLE "artifact" ADD CONSTRAINT "artifact_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;