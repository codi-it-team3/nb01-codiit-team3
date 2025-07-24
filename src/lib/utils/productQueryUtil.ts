import { ProductQuery } from '../../types/product';
import { Prisma } from '@prisma/client';

export function buildProductWhereQuery(
  params: ProductQuery,
  favoriteStoreIds: string[],
): Prisma.ProductWhereInput {
  const { name, storeName, categoryId, sizeId, minPrice, maxPrice } = params;

  return {
    ...(name && { name: { contains: name, mode: 'insensitive' } }),
    ...(storeName && { store: { name: { contains: storeName, mode: 'insensitive' } } }),
    ...(categoryId && { categoryId }),
    ...(sizeId && { stocks: { some: { sizeId } } }),
    ...(minPrice && { price: { gte: parseInt(minPrice) } }),
    ...(maxPrice && { price: { lte: parseInt(maxPrice) } }),
    ...(favoriteStoreIds.length > 0 && { storeId: { in: favoriteStoreIds } }),
  };
}

export function buildProductOrderByQuery(sort: string): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case 'price_low':
      return { price: 'asc' };
    case 'price_high':
      return { price: 'desc' };
    case 'rating':
      return { reviewsRating: 'desc' };
    case 'review':
      return { reviews: { _count: 'desc' } };
    case 'sales':
      return { SalesLog: { _count: 'desc' } };
    default:
      return { createdAt: 'desc' };
  }
}
