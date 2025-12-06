CREATE TABLE "opponents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "opponent_id" uuid;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_opponent_id_opponents_id_fk" FOREIGN KEY ("opponent_id") REFERENCES "public"."opponents"("id") ON DELETE set null ON UPDATE no action;