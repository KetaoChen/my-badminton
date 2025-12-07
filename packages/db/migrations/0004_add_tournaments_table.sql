CREATE TABLE IF NOT EXISTS "tournaments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "notes" text,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE "matches" ADD COLUMN IF NOT EXISTS "tournament_id" uuid REFERENCES "tournaments"("id") ON DELETE SET NULL;
ALTER TABLE "matches" ADD COLUMN IF NOT EXISTS "tournament" boolean NOT NULL DEFAULT false;

-- If any match previously marked tournament without id, leave as-is; future writes will set id.

