CREATE TABLE "commonbase" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"data" text NOT NULL,
	"metadata" json DEFAULT '{}'::json,
	"created" timestamp DEFAULT now() NOT NULL,
	"updated" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "embeddings" (
	"id" uuid PRIMARY KEY NOT NULL,
	"embedding" vector(1536) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "embeddings" ADD CONSTRAINT "embeddings_id_commonbase_id_fk" FOREIGN KEY ("id") REFERENCES "public"."commonbase"("id") ON DELETE cascade ON UPDATE no action;