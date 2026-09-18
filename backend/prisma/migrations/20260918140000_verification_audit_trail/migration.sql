-- AlterTable
ALTER TABLE "User" ADD COLUMN "verifiedAt" TIMESTAMP(3),
ADD COLUMN "verifiedById" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;