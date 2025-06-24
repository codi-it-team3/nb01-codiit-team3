import { Prisma } from '@prisma/client';
import { prismaClient } from '../lib/prismaClient';
import { CreateProductDto, UpdateProductDto, ProductQuery } from '../dto/productDTO';
import NotFoundError from '../lib/errors/NotFoundError';

export async function createProduct(data: CreateProductDto) {
  const store = await prismaClient.store.findUnique({ where: { id: data.storeId } });
  if (!store) throw new NotFoundError('store', data.storeId);

  const category = await prismaClient.category.findUnique({ where: { id: data.categoryId } });
  if (!category) throw new NotFoundError('category', data.categoryId);

  for (const stock of data.stocks) {
    const size = await prismaClient.size.findUnique({ where: { id: stock.sizeId } });
    if (!size) throw new NotFoundError('size', stock.sizeId);
  }
  return prismaClient.product.create({
    data: {
      name: data.name,
      price: data.price,
      storeId: data.storeId,
      categoryId: data.categoryId,
      image: data.image,
      content: data.content,
      discountRate: data.discountRate ?? 0,
      discountStartTime: data.discountStartTime ? new Date(data.discountStartTime) : undefined,
      discountEndTime: data.discountEndTime ? new Date(data.discountEndTime) : undefined,
      stocks: {
        createMany: {
          data: data.stocks.map((stock) => ({
            sizeId: stock.sizeId,
            quantity: stock.quantity,
          })),
        },
      },
    },
  });
}

export async function getProductList(params: ProductQuery, userId?: string) {
  const {
    name,
    storeName,
    categoryId,
    sizeId,
    minPrice,
    maxPrice,
    sort = 'recent',
    limit = '10',
    favoriteOnly,
  } = params;

  const page = String(params.page ?? '1');

  const take = parseInt(limit, 10);
  const skip = (parseInt(page, 10) - 1) * take;

  let favoriteStoreIds: string[] = [];
  if (favoriteOnly === 'true' && userId) {
    const favorites = await prismaClient.favoriteStore.findMany({
      where: { userId },
      select: { storeId: true },
    });

    favoriteStoreIds = favorites
      .map((fav) => fav.storeId)
      .filter((id): id is string => id !== null);
  }

  const where: Prisma.ProductWhereInput = {
    ...(name && {
      name: { contains: name, mode: 'insensitive' },
    }),
    ...(storeName && {
      store: { name: { contains: storeName, mode: 'insensitive' } },
    }),
    ...(categoryId && { categoryId }),
    ...(sizeId && {
      stocks: {
        some: { sizeId },
      },
    }),
    ...(minPrice && { price: { gte: parseInt(minPrice) } }),
    ...(maxPrice && { price: { lte: parseInt(maxPrice) } }),
    ...(favoriteStoreIds.length > 0 && {
      storeId: { in: favoriteStoreIds },
    }),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === 'price_low'
      ? { price: 'asc' }
      : sort === 'price_high'
        ? { price: 'desc' }
        : sort === 'rating'
          ? { reviewsRating: 'desc' }
          : sort === 'review'
            ? { reviews: { _count: 'desc' } }
            : sort === 'sales'
              ? { SalesLog: { _count: 'desc' } }
              : { createdAt: 'desc' };

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
        SalesLog: {
          select: {
            quantity: true,
          },
        },
      },
    }),
    prismaClient.product.count({ where }),
  ]);

  const totalPages = Math.ceil(total / take);

  const processedList = list.map((product) => {
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

  return {
    list: processedList,
    total,
    page: parseInt(page, 10),
    limit: take,
    totalPages,
  };
}

export async function getProductDetail(id: string) {
  const product = await prismaClient.product.findUnique({
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
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!product) return null;

  const discountPrice = product.discountRate
    ? Math.floor(product.price * (1 - product.discountRate / 100))
    : product.price;

  const reviewsCount = product.reviews.length;
  const sumScore = product.reviews.reduce((sum, r) => sum + r.rating, 0);
  const reviewsRating = reviewsCount > 0 ? Number((sumScore / reviewsCount).toFixed(1)) : 0;

  const rateCounts = [1, 2, 3, 4, 5].map(
    (rate) => product.reviews.filter((r) => r.rating === rate).length,
  );

  return {
    id: product.id,
    name: product.name,
    image: product.image,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    price: product.price,
    content: product.content,
    discountRate: product.discountRate,
    discountStartTime: product.discountStartTime,
    discountEndTime: product.discountEndTime,
    discountPrice,
    storeId: product.storeId,
    storeName: product.store.name,
    category: [{ id: product.category.id, name: product.category.name }],
    stocks: product.stocks.map((stock) => ({
      id: stock.id,
      productId: stock.productId,
      sizeId: stock.sizeId,
      quantity: stock.quantity,
      size: stock.size,
    })),
    reviewsCount,
    reviewsRating,
    reviews: [
      {
        rate1Length: rateCounts[0],
        rate2Length: rateCounts[1],
        rate3Length: rateCounts[2],
        rate4Length: rateCounts[3],
        rate5Length: rateCounts[4],
      },
      sumScore,
    ],
    inquiries: product.inquiries.map((inq) => ({
      id: inq.id,
      title: inq.title,
      content: inq.content,
      status: inq.status,
      isSecret: inq.isSecret,
      createdAt: inq.createdAt,
      updatedAt: inq.updatedAt,
      reply: inq.reply
        ? {
            id: inq.reply.id,
            content: inq.reply.content,
            createdAt: inq.reply.createdAt,
            updatedAt: inq.reply.updatedAt,
            user: inq.reply.user,
          }
        : null,
    })),
  };
}

export async function updateProduct(id: string, data: UpdateProductDto) {
  const existing = await prismaClient.product.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('product', id);

  if (data.categoryId) {
    const category = await prismaClient.category.findUnique({ where: { id: data.categoryId } });
    if (!category) throw new NotFoundError('category', data.categoryId);
  }

  if (data.stocks) {
    for (const stock of data.stocks) {
      const size = await prismaClient.size.findUnique({ where: { id: stock.sizeId } });
      if (!size) throw new NotFoundError('size', stock.sizeId);
    }
  }

  return prismaClient.$transaction(async (tx) => {
    const updatedProduct = await tx.product.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.price && { price: data.price }),
        ...(data.discountRate && { discountRate: data.discountRate }),
        ...(data.discountStartTime && { discountStartTime: new Date(data.discountStartTime) }),
        ...(data.discountEndTime && { discountEndTime: new Date(data.discountEndTime) }),
        ...(data.categoryId && { category: { connect: { id: data.categoryId } } }),
        ...(data.content && { content: data.content }),
      },
    });

    if (data.stocks) {
      await tx.stock.deleteMany({
        where: { productId: id },
      });

      await tx.stock.createMany({
        data: data.stocks.map((stock) => ({
          productId: id,
          sizeId: stock.sizeId,
          quantity: stock.quantity,
        })),
      });
    }

    return updatedProduct;
  });
}

export async function deleteProduct(id: string) {
  const product = await prismaClient.product.findUnique({ where: { id } });
  if (!product) {
    throw new NotFoundError('product', id);
  }

  await prismaClient.product.delete({ where: { id } });
}
