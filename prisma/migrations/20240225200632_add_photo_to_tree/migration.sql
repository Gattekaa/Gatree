/*
  Warnings:

  - You are about to drop the column `text_color` on the `Component` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Component" DROP COLUMN "text_color";

-- AlterTable
ALTER TABLE "Tree" ADD COLUMN     "photo" TEXT;
