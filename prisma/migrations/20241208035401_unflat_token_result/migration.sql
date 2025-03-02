/*
  Warnings:

  - You are about to drop the column `access_token` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `expires_in` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `refresh_token` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `scope` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `token_type` on the `Session` table. All the data in the column will be lost.
  - Added the required column `token_result` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Session" DROP COLUMN "access_token",
DROP COLUMN "expires_in",
DROP COLUMN "refresh_token",
DROP COLUMN "scope",
DROP COLUMN "token_type",
ADD COLUMN     "token_result" JSONB NOT NULL;
