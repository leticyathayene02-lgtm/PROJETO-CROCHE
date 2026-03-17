-- CreateEnum
CREATE TYPE "MaterialUnit" AS ENUM ('GRAMS', 'METERS', 'UNITS', 'PACKS');

-- CreateEnum
CREATE TYPE "MaterialCategory" AS ENUM ('YARN', 'FILLING', 'EYES', 'LABEL', 'BUTTON', 'ZIPPER', 'RING', 'PACKAGING', 'TAG', 'GIFT', 'OTHER');

-- CreateTable
CREATE TABLE "Material" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "MaterialCategory" NOT NULL DEFAULT 'OTHER',
    "brand" TEXT,
    "color" TEXT,
    "unit" "MaterialUnit" NOT NULL DEFAULT 'UNITS',
    "costPerUnit" DOUBLE PRECISION NOT NULL,
    "stock" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lowStockMin" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "supplier" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Material_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OverheadCost" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OverheadCost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Material_workspaceId_category_idx" ON "Material"("workspaceId", "category");

-- CreateIndex
CREATE INDEX "OverheadCost_workspaceId_idx" ON "OverheadCost"("workspaceId");

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OverheadCost" ADD CONSTRAINT "OverheadCost_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
