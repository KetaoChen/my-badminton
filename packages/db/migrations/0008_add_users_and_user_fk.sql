-- Create users table
CREATE TABLE IF NOT EXISTS "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "username" text NOT NULL UNIQUE,
  "password_hash" text NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

-- Seed initial user: chenketao / 31415926
INSERT INTO "users" ("id", "username", "password_hash")
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'chenketao',
  '$2b$10$cliuEGn23pQmtZ2UtAoxo.CIrtSPJhGEHwSIYT/2/er0vi4pcfmfS'
)
ON CONFLICT ("username") DO NOTHING;

-- Add user_id to opponents
ALTER TABLE "opponents" ADD COLUMN IF NOT EXISTS "user_id" uuid;
UPDATE "opponents" SET "user_id" = '11111111-1111-1111-1111-111111111111' WHERE "user_id" IS NULL;
ALTER TABLE "opponents" ALTER COLUMN "user_id" SET NOT NULL;
ALTER TABLE "opponents"
  ADD CONSTRAINT opponents_user_fk FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS opponents_user_id_idx ON "opponents" ("user_id");

-- Add user_id to tournaments
ALTER TABLE "tournaments" ADD COLUMN IF NOT EXISTS "user_id" uuid;
UPDATE "tournaments" SET "user_id" = '11111111-1111-1111-1111-111111111111' WHERE "user_id" IS NULL;
ALTER TABLE "tournaments" ALTER COLUMN "user_id" SET NOT NULL;
ALTER TABLE "tournaments"
  ADD CONSTRAINT tournaments_user_fk FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS tournaments_user_id_idx ON "tournaments" ("user_id");

-- Add user_id to matches
ALTER TABLE "matches" ADD COLUMN IF NOT EXISTS "user_id" uuid;
UPDATE "matches" SET "user_id" = '11111111-1111-1111-1111-111111111111' WHERE "user_id" IS NULL;
ALTER TABLE "matches" ALTER COLUMN "user_id" SET NOT NULL;
ALTER TABLE "matches"
  ADD CONSTRAINT matches_user_fk FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS matches_user_id_idx ON "matches" ("user_id");

