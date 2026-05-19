/*
  Warnings:

  - A unique constraint covering the columns `[cover]` on the table `Track` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[file]` on the table `Track` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[lyricsId]` on the table `Track` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Track_cover_file_lyricsId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Track_cover_key" ON "Track"("cover");

-- CreateIndex
CREATE UNIQUE INDEX "Track_file_key" ON "Track"("file");

-- CreateIndex
CREATE UNIQUE INDEX "Track_lyricsId_key" ON "Track"("lyricsId");
