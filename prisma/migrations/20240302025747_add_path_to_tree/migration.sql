/*
  Warnings:

  - A unique constraint covering the columns `[path]` on the table `Tree` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `path` to the `Tree` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tree" ADD COLUMN     "path" UNIQUE;

-- CreateIndex
CREATE UNIQUE INDEX "Tree_path_key" ON "Tree"("path");
