/*
  Warnings:

  - The primary key for the `Size` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `yearlyStoreSales` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[cartId,productId,sizeId]` on the table `CartItem` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Store` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `name` on the `Category` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `name` on the `Grade` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "GradeName" AS ENUM ('VIP', 'Black', 'Red', 'Orange', 'Green');

-- CreateEnum
CREATE TYPE "CategoryName" AS ENUM ('TOP', 'BOTTOM', 'DRESS', 'OUTER', 'SKIRT', 'SHOES', 'ACC');

-- DropForeignKey
ALTER TABLE "CartItem" DROP CONSTRAINT "CartItem_sizeId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_sizeId_fkey";

-- DropForeignKey
ALTER TABLE "Reply" DROP CONSTRAINT "Reply_userId_fkey";

-- DropForeignKey
ALTER TABLE "Stock" DROP CONSTRAINT "Stock_sizeId_fkey";

-- DropForeignKey
ALTER TABLE "yearlyStoreSales" DROP CONSTRAINT "yearlyStoreSales_storeId_fkey";

-- DropIndex
DROP INDEX "Cart_id_buyerId_key";

-- DropIndex
DROP INDEX "CartItem_cartId_productId_key";

-- AlterTable
ALTER TABLE "CartItem" ALTER COLUMN "sizeId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "name",
ADD COLUMN     "name" "CategoryName" NOT NULL;

-- AlterTable
ALTER TABLE "DailyStoreSales" ALTER COLUMN "totalSales" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "Grade" DROP COLUMN "name",
ADD COLUMN     "name" "GradeName" NOT NULL;

-- AlterTable
ALTER TABLE "MonthlyStoreSales" ALTER COLUMN "totalSales" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "OrderItem" ALTER COLUMN "sizeId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Size" DROP CONSTRAINT "Size_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Size_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Size_id_seq";

-- AlterTable
ALTER TABLE "Stock" ALTER COLUMN "sizeId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "WeeklyStoreSales" ALTER COLUMN "totalSales" SET DATA TYPE BIGINT;

-- DropTable
DROP TABLE "yearlyStoreSales";

-- CreateTable
CREATE TABLE "YearlyStoreSales" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "totalSales" BIGINT NOT NULL,
    "totalOrders" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "YearlyStoreSales_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "YearlyStoreSales_storeId_year_key" ON "YearlyStoreSales"("storeId", "year");

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_cartId_productId_sizeId_key" ON "CartItem"("cartId", "productId", "sizeId");

-- CreateIndex
CREATE UNIQUE INDEX "Store_name_key" ON "Store"("name");

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "Size"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reply" ADD CONSTRAINT "Reply_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "Size"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "Size"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YearlyStoreSales" ADD CONSTRAINT "YearlyStoreSales_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
