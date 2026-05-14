/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "LyricsFormat" ADD VALUE 'LYS';
ALTER TYPE "LyricsFormat" ADD VALUE 'YRC';
ALTER TYPE "LyricsFormat" ADD VALUE 'LYL';

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");
