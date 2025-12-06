CREATE TYPE "public"."point_for" AS ENUM('self', 'opponent');--> statement-breakpoint
CREATE TYPE "public"."rally_result" AS ENUM('win', 'lose');--> statement-breakpoint
CREATE TABLE "matches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"match_date" date,
	"opponent" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rallies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"match_id" uuid NOT NULL,
	"sequence" integer,
	"result" "rally_result" NOT NULL,
	"point_for" "point_for" NOT NULL,
	"point_reason" text,
	"start_score_self" integer,
	"start_score_opponent" integer,
	"end_score_self" integer,
	"end_score_opponent" integer,
	"duration_seconds" integer,
	"shot_pattern" jsonb,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "rallies" ADD CONSTRAINT "rallies_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "rallies_match_id_idx" ON "rallies" USING btree ("match_id");