-- Add match_number to matches
ALTER TABLE "matches" ADD COLUMN IF NOT EXISTS "match_number" integer;

-- Optional helper index for sorting by date then match number
CREATE INDEX IF NOT EXISTS matches_match_date_number_idx
  ON "matches" (match_date, match_number);

