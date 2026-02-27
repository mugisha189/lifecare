/*
  Warnings:

  - You are about to drop the `car_sharings` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'FLAGGED');

-- DropForeignKey
ALTER TABLE "public"."car_sharings" DROP CONSTRAINT "car_sharings_rideId_fkey";

-- DropForeignKey
ALTER TABLE "public"."car_sharings" DROP CONSTRAINT "car_sharings_userId_fkey";

-- AlterTable
ALTER TABLE "passenger_profiles" ADD COLUMN     "blockedDriverIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "minDriverRating" DOUBLE PRECISION DEFAULT 3.0,
ADD COLUMN     "preferredDriverIds" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "editedAt" TIMESTAMP(3),
ADD COLUMN     "flagReason" TEXT,
ADD COLUMN     "isEdited" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isFlagged" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "moderatedAt" TIMESTAMP(3),
ADD COLUMN     "moderatedBy" TEXT,
ADD COLUMN     "moderationNote" TEXT,
ADD COLUMN     "status" "ReviewStatus" NOT NULL DEFAULT 'APPROVED';

-- DropTable
DROP TABLE "public"."car_sharings";

-- DropEnum
DROP TYPE "public"."ShareType";

-- CreateIndex
CREATE INDEX "passenger_profiles_minDriverRating_idx" ON "passenger_profiles"("minDriverRating");

-- CreateIndex
CREATE INDEX "reviews_status_idx" ON "reviews"("status");

-- CreateIndex
CREATE INDEX "reviews_isFlagged_idx" ON "reviews"("isFlagged");
