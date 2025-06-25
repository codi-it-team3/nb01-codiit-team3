import { prismaClient } from '../lib/prismaClient';
import { CreateProductDto, UpdateProductDto } from '../dto/productDTO';

export async function createProduct(data: CreateProductDto & { userId: string }) {
  const store = await prismaClient.store.findUnique({
    where: { userId: data.userId },
  });

  if (!store) {
    throw new Error('해당 유저의 스토어가 존재하지 않습니다.');
  }

  return await prismaClient.product.create({
    data: {
      name: data.name,
      price: data.price,
      content: data.content,
      image: data.image,
      discountRate: data.discountRate,
      discountStartTime: data.discountStartTime ? new Date(data.discountStartTime) : undefined,
      discountEndTime: data.discountEndTime ? new Date(data.discountEndTime) : undefined,
      store: { connect: { id: store.id } },
      category: { connect: { id: data.categoryId } },
      stocks: {
        create: data.stocks.map((s) => ({
          sizeId: s.sizeId,
          quantity: s.quantity,
        })),
      },
    },
    include: {
      stocks: { include: { size: true } },
      category: true,
    },
  });
}

export async function updateProduct(productId: string, data: UpdateProductDto) {
  const {
    name,
    price,
    content,
    discountRate,
    discountStartTime,
    discountEndTime,
    categoryId,
    image,
  } = data;

  return await prismaClient.product.update({
    where: { id: productId },
    data: {
      ...(name && { name }),
      ...(price && { price }),
      ...(content && { content }),
      ...(discountRate !== undefined && { discountRate }),
      ...(discountStartTime && { discountStartTime: new Date(discountStartTime) }),
      ...(discountEndTime && { discountEndTime: new Date(discountEndTime) }),
      ...(image && { image: typeof image === 'string' ? image : image[0] }),
      ...(categoryId && { category: { connect: { id: categoryId } } }),
    },
  });
}

export async function getProductList(params?: { page?: number; limit?: number }) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;
  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    prismaClient.product.findMany({
      skip,
      take: limit,
      include: {
        stocks: true,
      },
    }),
    prismaClient.product.count(),
  ]);

  return {
    list: products,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getProductDetail(productId: string) {
  return await prismaClient.product.findUnique({
    where: { id: productId },
    include: {
      store: {
        select: {
          userId: true,
        },
      },
    },
  });
}

export async function deleteProduct(productId: string) {
  return await prismaClient.product.delete({
    where: { id: productId },
  });
}
