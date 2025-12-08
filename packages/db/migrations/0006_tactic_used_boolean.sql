ALTER TABLE rallies ADD COLUMN IF NOT EXISTS tactic_used boolean NOT NULL DEFAULT false;

UPDATE rallies SET tactic_used = true WHERE tactic_score IS NOT NULL;

ALTER TABLE rallies DROP COLUMN IF EXISTS tactic_score;

