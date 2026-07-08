-- AlterTable
ALTER TABLE "Product"
ADD COLUMN "imageUrl" TEXT,
ADD COLUMN "compareAtCents" INTEGER;

-- CreateTable
CREATE TABLE "FlashSale" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FlashSale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlashSaleProduct" (
    "id" TEXT NOT NULL,
    "flashSaleId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "salePriceCents" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FlashSaleProduct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FlashSale_isActive_endsAt_idx" ON "FlashSale"("isActive", "endsAt");

-- CreateIndex
CREATE INDEX "FlashSaleProduct_productId_idx" ON "FlashSaleProduct"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "FlashSaleProduct_flashSaleId_productId_key" ON "FlashSaleProduct"("flashSaleId", "productId");

-- AddForeignKey
ALTER TABLE "FlashSaleProduct" ADD CONSTRAINT "FlashSaleProduct_flashSaleId_fkey" FOREIGN KEY ("flashSaleId") REFERENCES "FlashSale"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlashSaleProduct" ADD CONSTRAINT "FlashSaleProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
