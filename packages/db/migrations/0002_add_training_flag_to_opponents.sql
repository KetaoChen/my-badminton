ALTER TABLE "opponents" ADD COLUMN "training" boolean NOT NULL DEFAULT false;

-- Backfill possible existing training opponents by notes marker
UPDATE "opponents" SET "training" = true WHERE "notes" = '训练对手';

