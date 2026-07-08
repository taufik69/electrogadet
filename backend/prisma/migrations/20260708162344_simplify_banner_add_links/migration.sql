-- AlterTable
ALTER TABLE "Banner"
DROP COLUMN "eyebrow",
DROP COLUMN "subtitle",
DROP COLUMN "ctaLabel",
DROP COLUMN "ctaHref",
DROP COLUMN "secondaryCtaLabel",
DROP COLUMN "secondaryCtaHref",
ADD COLUMN "productId" TEXT,
ADD COLUMN "categoryId" TEXT;

-- CreateIndex
CREATE INDEX "Banner_productId_idx" ON "Banner"("productId");

-- CreateIndex
CREATE INDEX "Banner_categoryId_idx" ON "Banner"("categoryId");

-- AddForeignKey
ALTER TABLE "Banner" ADD CONSTRAINT "Banner_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Banner" ADD CONSTRAINT "Banner_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
