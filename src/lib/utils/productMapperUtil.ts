import { Prisma } from '@prisma/client';
import { ProductListItem, UpdateProductInput } from '../../types/product';

export type ProductListMapped = ReturnType<typeof mapProductListWithStats>[number];

export function mapProductListWithStats(products: ProductListItem[]) {
  return products.map((product) => {
    const totalQuantity = product.stocks.reduce((sum, stock) => sum + stock.quantity, 0);
    const isSoldOut = totalQuantity === 0;

    const totalSales = product.SalesLog.reduce((sum, log) => sum + log.quantity, 0);

    const discountPrice = product.discountRate
      ? Math.floor(product.price * (1 - product.discountRate / 100))
      : product.price;

    return {
      ...product,
      discountPrice,
      isSoldOut,
      reviewsCount: product._count.reviews,
      sales: totalSales,
    };
  });
}

export function mapUpdateProductData(data: UpdateProductInput): Prisma.ProductUpdateInput {
  const updateData: Prisma.ProductUpdateInput = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.price !== undefined) updateData.price = data.price;
  if (data.discountRate !== undefined) updateData.discountRate = data.discountRate;
  if (data.discountStartTime !== undefined) {
    updateData.discountStartTime = new Date(data.discountStartTime);
  }
  if (data.discountEndTime !== undefined) {
    updateData.discountEndTime = new Date(data.discountEndTime);
  }
  if (data.categoryId !== undefined) {
    updateData.category = { connect: { id: data.categoryId } };
  }
  if (data.content !== undefined) updateData.content = data.content;

  return updateData;
}
