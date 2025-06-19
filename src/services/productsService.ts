import { Prisma } from '@prisma/client';
import { prismaClient } from '../lib/prismaClient';
import { CreateProductDto, UpdateProductDto, ProductQuery } from '../dto/productDTO';
import NotFoundError from '../lib/errors/NotFoundError';

export async function createProduct(data: CreateProductDto) {
  return prismaClient.product.create({
    data: {
      name: data.name,
      price: data.price,
      storeId: data.storeId,
      categoryId: data.categoryId,
      image: data.image,
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

export async function getProductList(params: ProductQuery) {
  const { name, categoryId, storeId, sizeId, sort = 'recent', page = '1', limit = '10' } = params;

  const take = parseInt(limit, 10);
  const skip = (parseInt(page, 10) - 1) * take;

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === 'price_low'
      ? { price: 'asc' }
      : sort === 'price_high'
        ? { price: 'desc' }
        : { createdAt: 'desc' };

  const where: Prisma.ProductWhereInput = {
    ...(name && {
      name: {
        contains: name,
        mode: Prisma.QueryMode.insensitive,
      },
    }),
    ...(categoryId && { categoryId }),
    ...(storeId && { storeId }),
    ...(sizeId && {
      stocks: {
        some: {
          sizeId: sizeId,
        },
      },
    }),
  };

  return prismaClient.product.findMany({
    where,
    include: {
      category: true,
      stocks: {
        include: { size: true },
      },
    },
    orderBy,
    skip,
    take,
  });
}

export async function getProductDetail(id: string) {
  return prismaClient.product.findUnique({
    where: { id },
    include: {
      stocks: { include: { size: true } },
      category: true,
    },
  });
}

export async function updateProduct(id: string, data: UpdateProductDto) {
  const existing = await prismaClient.product.findUnique({ where: { id } });
  if (!existing) {
    throw new NotFoundError('product', id);
  }

  return prismaClient.product.update({
    where: { id },
    data: {
      ...data,
      discountStartTime: data.discountStartTime ? new Date(data.discountStartTime) : undefined,
      discountEndTime: data.discountEndTime ? new Date(data.discountEndTime) : undefined,
    },
  });
}

export async function deleteProduct(id: string) {
  const product = await prismaClient.product.findUnique({ where: { id } });
  if (!product) {
    throw new NotFoundError('product', id);
  }

  await prismaClient.product.delete({ where: { id } });
}
