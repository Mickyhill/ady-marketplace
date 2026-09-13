/*
  Warnings:

  - You are about to drop the column `studentIdPhotoUrl` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "boostedUntil" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" DROP COLUMN "studentIdPhotoUrl",
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "studentPortalScreenshotUrl" TEXT;

-- CreateTable
CREATE TABLE "ListingBoost" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "amountKobo" INTEGER NOT NULL,
    "durationDays" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "providerReference" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListingBoost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ListingBoost_providerReference_key" ON "ListingBoost"("providerReference");

-- AddForeignKey
ALTER TABLE "ListingBoost" ADD CONSTRAINT "ListingBoost_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
