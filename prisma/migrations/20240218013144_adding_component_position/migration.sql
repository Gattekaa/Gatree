/*
  Warnings:

  - Added the required column `position` to the `Component` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Component" ADD COLUMN     "position" INTEGER NOT NULL;
