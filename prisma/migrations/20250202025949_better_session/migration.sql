/*
  Warnings:

  - You are about to drop the column `updated_at` on the `Session` table. All the data in the column will be lost.
  - Added the required column `expires` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_user_id_fkey";

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "updated_at",
ADD COLUMN     "expires" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "user_id" DROP NOT NULL,
ALTER COLUMN "token_result" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
