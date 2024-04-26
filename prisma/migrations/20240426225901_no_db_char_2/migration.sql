/*
  Warnings:

  - The primary key for the `Receipt` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Receipt"
ALTER COLUMN "id" SET DATA TYPE TEXT;
