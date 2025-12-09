-- Drop unused shot_pattern column from rallies
ALTER TABLE "rallies" DROP COLUMN IF EXISTS "shot_pattern";

