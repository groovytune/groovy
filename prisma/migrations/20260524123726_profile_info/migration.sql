-- AlterTable
ALTER TABLE "user" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "favoriteTrackId" TEXT;

-- CreateTable
CREATE TABLE "_UserGenres" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserGenres_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_UserGenres_B_index" ON "_UserGenres"("B");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_favoriteTrackId_fkey" FOREIGN KEY ("favoriteTrackId") REFERENCES "Track"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserGenres" ADD CONSTRAINT "_UserGenres_A_fkey" FOREIGN KEY ("A") REFERENCES "Genre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserGenres" ADD CONSTRAINT "_UserGenres_B_fkey" FOREIGN KEY ("B") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
