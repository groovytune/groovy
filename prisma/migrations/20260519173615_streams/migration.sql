/*
  Warnings:

  - A unique constraint covering the columns `[cover]` on the table `Release` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cover,file,lyricsId]` on the table `Track` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Track_lyricsId_key";

-- CreateTable
CREATE TABLE "Stream" (
    "id" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "userId" TEXT,
    "hostname" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Stream_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Release_cover_key" ON "Release"("cover");

-- CreateIndex
CREATE UNIQUE INDEX "Track_cover_file_lyricsId_key" ON "Track"("cover", "file", "lyricsId");

-- AddForeignKey
ALTER TABLE "Stream" ADD CONSTRAINT "Stream_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stream" ADD CONSTRAINT "Stream_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
