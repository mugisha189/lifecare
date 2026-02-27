-- Run this with: psql -d lifecare -f prisma/add_consultation_code_manual.sql
-- Or: psql "postgresql://user:pass@localhost:5432/lifecare" -f prisma/add_consultation_code_manual.sql

-- 1. Add column (nullable first)
ALTER TABLE "consultations" ADD COLUMN IF NOT EXISTS "code" TEXT;

-- 2. Backfill existing row(s): LifeCare-YYYY-MM-DD-N
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

-- 3. Any remaining nulls (fallback)
UPDATE "consultations"
SET "code" = 'LifeCare-' || to_char("createdAt", 'YYYY-MM-DD') || '-' || substr(md5(id::text), 1, 8)
WHERE "code" IS NULL;

-- 4. Enforce NOT NULL and UNIQUE
ALTER TABLE "consultations" ALTER COLUMN "code" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "consultations_code_key" ON "consultations"("code");
