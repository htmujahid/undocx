CREATE TABLE "artifact_favorite" (
	"user_id" text NOT NULL,
	"artifact_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "artifact_favorite_user_id_artifact_id_pk" PRIMARY KEY("user_id","artifact_id")
);
--> statement-breakpoint
ALTER TABLE "artifact_favorite" ADD CONSTRAINT "artifact_favorite_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "artifact_favorite" ADD CONSTRAINT "artifact_favorite_artifact_id_artifact_id_fk" FOREIGN KEY ("artifact_id") REFERENCES "public"."artifact"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "artifactFavorite_userId_idx" ON "artifact_favorite" USING btree ("user_id");
