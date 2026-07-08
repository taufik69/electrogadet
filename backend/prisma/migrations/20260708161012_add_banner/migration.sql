-- CreateTable
CREATE TABLE "Banner" (
    "id" TEXT NOT NULL,
    "eyebrow" TEXT,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "imageUrl" TEXT,
    "ctaLabel" TEXT,
    "ctaHref" TEXT,
    "secondaryCtaLabel" TEXT,
    "secondaryCtaHref" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Banner_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Banner_isActive_sortOrder_idx" ON "Banner"("isActive", "sortOrder");
