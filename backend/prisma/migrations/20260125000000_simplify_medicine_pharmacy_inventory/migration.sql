ALTER TABLE "medicines" ADD COLUMN IF NOT EXISTS "description" TEXT;

UPDATE "medicines" SET "description" = '' WHERE "description" IS NULL;

ALTER TABLE "medicines" DROP COLUMN IF EXISTS "genericName";
ALTER TABLE "medicines" DROP COLUMN IF EXISTS "manufacturer";
ALTER TABLE "medicines" DROP COLUMN IF EXISTS "dosage";
ALTER TABLE "medicines" DROP COLUMN IF EXISTS "form";
ALTER TABLE "medicines" DROP COLUMN IF EXISTS "unit";
ALTER TABLE "medicines" DROP COLUMN IF EXISTS "stockQuantity";
ALTER TABLE "medicines" DROP COLUMN IF EXISTS "minStockLevel";

CREATE TABLE IF NOT EXISTS "pharmacy_medicines" (
    "id" TEXT NOT NULL,
    "pharmacyId" TEXT NOT NULL,
    "medicineId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "minStockLevel" INTEGER NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pharmacy_medicines_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "pharmacy_medicines_pharmacyId_medicineId_key" ON "pharmacy_medicines"("pharmacyId", "medicineId");
CREATE INDEX IF NOT EXISTS "pharmacy_medicines_pharmacyId_idx" ON "pharmacy_medicines"("pharmacyId");
CREATE INDEX IF NOT EXISTS "pharmacy_medicines_medicineId_idx" ON "pharmacy_medicines"("medicineId");

ALTER TABLE "pharmacy_medicines" ADD CONSTRAINT "pharmacy_medicines_pharmacyId_fkey" FOREIGN KEY ("pharmacyId") REFERENCES "pharmacies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pharmacy_medicines" ADD CONSTRAINT "pharmacy_medicines_medicineId_fkey" FOREIGN KEY ("medicineId") REFERENCES "medicines"("id") ON DELETE CASCADE ON UPDATE CASCADE;
