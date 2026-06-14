CREATE TABLE "ai_usage" (
	"user_id" text NOT NULL,
	"day" text NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "ai_usage_user_id_day_pk" PRIMARY KEY("user_id","day")
);
--> statement-breakpoint
ALTER TABLE "ai_usage" ADD CONSTRAINT "ai_usage_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;