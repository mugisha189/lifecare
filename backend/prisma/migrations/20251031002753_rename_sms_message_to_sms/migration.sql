/*
  Warnings:

  - You are about to drop the `sms_messages` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."sms_messages" DROP CONSTRAINT "sms_messages_userId_fkey";

-- DropTable
DROP TABLE "public"."sms_messages";

-- CreateTable
CREATE TABLE "sms" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "status" TEXT,
    "provider" TEXT,
    "externalId" TEXT,
    "sentAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sms_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sms_userId_idx" ON "sms"("userId");

-- CreateIndex
CREATE INDEX "sms_status_idx" ON "sms"("status");

-- CreateIndex
CREATE INDEX "sms_sentAt_idx" ON "sms"("sentAt");

-- AddForeignKey
ALTER TABLE "sms" ADD CONSTRAINT "sms_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
