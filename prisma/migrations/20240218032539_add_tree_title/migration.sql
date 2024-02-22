/*
  Warnings:

  - Added the required column `title` to the `Tree` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tree" ADD COLUMN     "title" TEXT NOT NULL;
