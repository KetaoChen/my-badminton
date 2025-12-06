ALTER TABLE "matches" ADD COLUMN IF NOT EXISTS "tournament" boolean NOT NULL DEFAULT false;

