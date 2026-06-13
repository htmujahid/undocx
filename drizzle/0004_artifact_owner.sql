ALTER TABLE "artifact" ADD COLUMN "owner_id" text NOT NULL REFERENCES "public"."user"("id") ON DELETE cascade;
--> statement-breakpoint
CREATE INDEX "artifact_ownerId_idx" ON "artifact" USING btree ("owner_id");
