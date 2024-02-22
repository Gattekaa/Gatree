/*
  Warnings:

  - You are about to drop the column `background_color` on the `Component` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Component" DROP COLUMN "background_color",
ADD COLUMN     "backgroundColor" TEXT,
ADD COLUMN     "textColor" TEXT;
