-- CreateEnum
CREATE TYPE "ProductionStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'FINISHING', 'READY', 'DELIVERED');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "checklistJson" JSONB,
ADD COLUMN     "customerId" TEXT,
ADD COLUMN     "productionStatus" "ProductionStatus" NOT NULL DEFAULT 'TODO';

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "instagram" TEXT,
    "whatsapp" TEXT,
    "city" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeEntry" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "orderId" TEXT,
    "productId" TEXT,
    "stage" TEXT NOT NULL,
    "minutes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TimeEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Customer_workspaceId_name_idx" ON "Customer"("workspaceId", "name");

-- CreateIndex
CREATE INDEX "TimeEntry_workspaceId_createdAt_idx" ON "TimeEntry"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "Order_workspaceId_productionStatus_idx" ON "Order"("workspaceId", "productionStatus");

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
