-- Add code column to consultations (nullable first for backfill)
ALTER TABLE "consultations" ADD COLUMN IF NOT EXISTS "code" TEXT;

-- Backfill existing rows with LifeCare-YYYY-MM-DD-N (N = row number per day)
WITH numbered AS (
  SELECT id,
    ROW_NUMBER() OVER (PARTITION BY date_trunc('day', "createdAt") ORDER BY "createdAt") AS rn,
    "createdAt"
  FROM "consultations"
  WHERE "code" IS NULL
)
UPDATE "consultations" c
SET "code" = 'LifeCare-' || to_char(n."createdAt", 'YYYY-MM-DD') || '-' || n.rn
FROM numbered n
WHERE c.id = n.id;

-- Set code for any remaining nulls to avoid NOT NULL violation
UPDATE "consultations"
SET "code" = 'LifeCare-' || to_char("createdAt", 'YYYY-MM-DD') || '-' || substr(md5(id::text), 1, 8)
WHERE "code" IS NULL;

-- Enforce NOT NULL and UNIQUE
ALTER TABLE "consultations" ALTER COLUMN "code" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "consultations_code_key" ON "consultations"("code");
