-- Drop unused duration_seconds column from rallies
ALTER TABLE "rallies" DROP COLUMN IF EXISTS "duration_seconds";

