-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "asaasCustomerId" TEXT,
ADD COLUMN     "asaasSubscriptionId" TEXT,
ADD COLUMN     "lastAsaasPaymentId" TEXT,
ADD COLUMN     "lastPaymentAt" TIMESTAMP(3);
