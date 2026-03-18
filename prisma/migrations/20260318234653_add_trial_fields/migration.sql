-- CreateEnum
CREATE TYPE "AccessStatus" AS ENUM ('TRIAL', 'ACTIVE', 'BLOCKED');

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "accessStatus" "AccessStatus" NOT NULL DEFAULT 'TRIAL',
ADD COLUMN     "trialEndAt" TIMESTAMP(3),
ADD COLUMN     "trialStartAt" TIMESTAMP(3);
