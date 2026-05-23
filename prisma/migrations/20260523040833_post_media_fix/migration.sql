/*
  Warnings:

  - You are about to drop the column `media` on the `PostLike` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "media" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "PostLike" DROP COLUMN "media";
