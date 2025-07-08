/*
  Warnings:

  - A unique constraint covering the columns `[productId,sizeId]` on the table `Stock` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Stock_productId_sizeId_key" ON "Stock"("productId", "sizeId");
