/*
  Warnings:

  - Added the required column `detailAddress` to the `Store` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Store_name_key";

-- AlterTable
ALTER TABLE "FavoriteStore" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "detailAddress" TEXT NOT NULL;
