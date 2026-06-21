/*
  Warnings:

  - The values [LYS,YRC,LYL] on the enum `LyricsFormat` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "LyricsFormat_new" AS ENUM ('LRC', 'TTML', 'SRT', 'TXT');
ALTER TABLE "Lyrics" ALTER COLUMN "format" TYPE "LyricsFormat_new" USING ("format"::text::"LyricsFormat_new");
ALTER TYPE "LyricsFormat" RENAME TO "LyricsFormat_old";
ALTER TYPE "LyricsFormat_new" RENAME TO "LyricsFormat";
DROP TYPE "public"."LyricsFormat_old";
COMMIT;
