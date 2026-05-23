-- AlterTable
ALTER TABLE "PostLike" ADD COLUMN     "media" TEXT[] DEFAULT ARRAY[]::TEXT[];
