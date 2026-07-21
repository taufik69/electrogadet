-- CreateEnum
CREATE TYPE "ArticleStatus" AS ENUM ('draft', 'published', 'archived');

-- AlterEnum
ALTER TYPE "ImageOwnerType" ADD VALUE 'article_cover';

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorName" TEXT,
    "tags" TEXT[],
    "status" "ArticleStatus" NOT NULL DEFAULT 'draft',
    "publishedAt" TIMESTAMP(3),
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleSeo" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "metaTitle" VARCHAR(70),
    "metaDescription" VARCHAR(200),
    "metaKeywords" TEXT[],
    "canonicalUrl" TEXT,
    "focusKeyword" TEXT,
    "ogTitle" VARCHAR(70),
    "ogDescription" VARCHAR(200),
    "twitterCard" "TwitterCard" NOT NULL DEFAULT 'summary_large_image',
    "structuredData" JSONB,
    "noIndex" BOOLEAN NOT NULL DEFAULT false,
    "noFollow" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArticleSeo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Article_slug_key" ON "Article"("slug");

-- CreateIndex
CREATE INDEX "Article_status_publishedAt_idx" ON "Article"("status", "publishedAt" DESC);

-- CreateIndex
CREATE INDEX "Article_createdAt_idx" ON "Article"("createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "ArticleSeo_articleId_key" ON "ArticleSeo"("articleId");

-- AddForeignKey
ALTER TABLE "ArticleSeo" ADD CONSTRAINT "ArticleSeo_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;
