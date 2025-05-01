-- AlterTable
ALTER TABLE "Component" ADD COLUMN     "disabled" BOOLEAN DEFAULT false,
ADD COLUMN     "type" TEXT DEFAULT 'component';
