/*
  Warnings:

  - A unique constraint covering the columns `[releaseId,userId]` on the table `ReleaseLike` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[trackId,userId]` on the table `TrackLike` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ReleaseLike_releaseId_userId_key" ON "ReleaseLike"("releaseId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "TrackLike_trackId_userId_key" ON "TrackLike"("trackId", "userId");
