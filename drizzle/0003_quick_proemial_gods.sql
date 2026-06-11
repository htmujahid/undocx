CREATE TABLE "artifact_collection" (
	"artifact_id" uuid NOT NULL,
	"collection_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "artifact_collection_artifact_id_collection_id_pk" PRIMARY KEY("artifact_id","collection_id")
);
--> statement-breakpoint
CREATE TABLE "artifact_folder" (
	"artifact_id" uuid NOT NULL,
	"folder_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "artifact_folder_artifact_id_folder_id_pk" PRIMARY KEY("artifact_id","folder_id")
);
--> statement-breakpoint
ALTER TABLE "artifact" DROP CONSTRAINT "artifact_folder_id_folder_id_fk";
--> statement-breakpoint
ALTER TABLE "artifact" DROP CONSTRAINT "artifact_collection_id_collection_id_fk";
--> statement-breakpoint
DROP INDEX "artifact_folderId_idx";--> statement-breakpoint
DROP INDEX "artifact_collectionId_idx";--> statement-breakpoint
ALTER TABLE "artifact" ADD COLUMN "is_archived" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "artifact_collection" ADD CONSTRAINT "artifact_collection_artifact_id_artifact_id_fk" FOREIGN KEY ("artifact_id") REFERENCES "public"."artifact"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artifact_collection" ADD CONSTRAINT "artifact_collection_collection_id_collection_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collection"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artifact_folder" ADD CONSTRAINT "artifact_folder_artifact_id_artifact_id_fk" FOREIGN KEY ("artifact_id") REFERENCES "public"."artifact"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artifact_folder" ADD CONSTRAINT "artifact_folder_folder_id_folder_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."folder"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "artifactCollection_collectionId_idx" ON "artifact_collection" USING btree ("collection_id");--> statement-breakpoint
CREATE INDEX "artifactFolder_folderId_idx" ON "artifact_folder" USING btree ("folder_id");--> statement-breakpoint
INSERT INTO "artifact_folder" ("artifact_id", "folder_id") SELECT "id", "folder_id" FROM "artifact" WHERE "folder_id" IS NOT NULL;--> statement-breakpoint
INSERT INTO "artifact_collection" ("artifact_id", "collection_id") SELECT "id", "collection_id" FROM "artifact" WHERE "collection_id" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "artifact" DROP COLUMN "folder_id";--> statement-breakpoint
ALTER TABLE "artifact" DROP COLUMN "collection_id";