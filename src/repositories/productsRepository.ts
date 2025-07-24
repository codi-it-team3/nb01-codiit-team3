import { prismaClient } from '../lib/prismaClient';
import { Prisma } from '@prisma/client';

export const findStoreById = (id: string) => prismaClient.store.findUnique({ where: { id } });

export const findCategoryById = (id: string) => prismaClient.category.findUnique({ where: { id } });

export const findSizeById = (id: string) => prismaClient.size.findUnique({ where: { id } });

export const findProductById = (id: string) =>
  prismaClient.product.findUnique({
    where: { id },
    include: {
      store: {
        select: {
          id: true,
          userId: true,
        },
      },
    },
  });

export const deleteProductById = (id: string) => prismaClient.product.delete({ where: { id } });

export const getFavoriteStoreIds = async (userId: string): Promise<string[]> => {
  const list = await prismaClient.favoriteStore.findMany({
    where: { userId },
    select: { storeId: true },
  });
  return list.map((f) => f.storeId).filter((id): id is string => !!id);
};

export const createProductInDB = (data: Prisma.ProductCreateInput) =>
  prismaClient.product.create({ data });

export const getFilteredProductListAndCount = async ({
  where,
  orderBy,
  skip,
  take,
}: {
  where: Prisma.ProductWhereInput;
  orderBy: Prisma.ProductOrderByWithRelationInput;
  skip: number;
  take: number;
}) => {
  const [list, total] = await Promise.all([
    prismaClient.product.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        category: true,
        stocks: { include: { size: true } },
        store: true,
        _count: { select: { reviews: true } },
        SalesLog: { select: { quantity: true } },
      },
    }),
    prismaClient.product.count({ where }),
  ]);
  return [list, total] as const;
};

export const getProductDetailById = (id: string) =>
  prismaClient.product.findUnique({
    where: { id },
    include: {
      stocks: { include: { size: true } },
      category: true,
      store: { select: { name: true } },
      reviews: { select: { rating: true } },
      inquiries: {
        include: {
          reply: {
            include: {
              user: { select: { id: true, name: true } },
            },
          },
        },
      },
    },
  });

export const runUpdateProductTx = (
  id: string,
  data: Prisma.ProductUpdateInput,
  stocks?: { sizeId: string; quantity: number }[],
) =>
  prismaClient.$transaction(async (tx) => {
    const updated = await tx.product.update({ where: { id }, data });

    if (stocks) {
      await tx.stock.deleteMany({ where: { productId: id } });
      await tx.stock.createMany({
        data: stocks.map((s) => ({
          productId: id,
          sizeId: s.sizeId,
          quantity: s.quantity,
        })),
      });
    }

    return updated;
  });

export async function getProductById(id: string) {
  const product = await prismaClient.product.findUnique({
    where: { id },
  });
  return product;
}

export const upsertProductView = async (userId: string, productId: string) => {
  await prismaClient.recentProductView.deleteMany({ where: { userId, productId } });
  await prismaClient.recentProductView.create({ data: { userId, productId } });
};

export const getLatestProductView = (userId: string) =>
  prismaClient.recentProductView.findFirst({
    where: { userId },
    orderBy: { viewedAt: 'desc' },
    select: {
      product: {
        select: {
          id: true,
          categoryId: true,
        },
      },
    },
  });

export const getProductListByCategoryExceptOne = (
  categoryId: string,
  excludeProductId: string,
  limit = 4,
) =>
  prismaClient.product.findMany({
    where: {
      categoryId,
      id: { not: excludeProductId },
    },
    orderBy: { viewCount: 'desc' },
    take: limit,
    include: {
      category: true,
      stocks: { include: { size: true } },
      store: true,
      _count: { select: { reviews: true } },
      SalesLog: { select: { quantity: true } },
    },
  });

export const getPopularProductList = (limit = 4) =>
  prismaClient.product.findMany({
    orderBy: { viewCount: 'desc' },
    take: limit,
    include: {
      category: true,
      stocks: { include: { size: true } },
      store: true,
      _count: { select: { reviews: true } },
      SalesLog: { select: { quantity: true } },
    },
  });
