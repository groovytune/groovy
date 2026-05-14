/*
  Warnings:

  - You are about to drop the column `name` on the `Lyrics` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[trackId]` on the table `Lyrics` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[lyricsId]` on the table `Track` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Lyrics" DROP COLUMN "name";

-- AlterTable
ALTER TABLE "Track" ADD COLUMN     "lyricsId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Lyrics_trackId_key" ON "Lyrics"("trackId");

-- CreateIndex
CREATE UNIQUE INDEX "Track_lyricsId_key" ON "Track"("lyricsId");
