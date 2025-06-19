import { prismaClient } from '../lib/prismaClient';

export async function createProduct(data: {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  discountRate?: number;
  discountStartTime?: string;
  discountEndTime?: string;
  tags?: string[];
  images: string[];
  stocks: { sizeId: number; quantity: number }[];
  userId: string;
}) {
  const store = await prismaClient.store.findUnique({
    where: { userId: data.userId },
  });

  if (!store) {
    throw new Error('해당 유저의 스토어가 존재하지 않습니다.');
  }

  const createdProduct = await prismaClient.product.create({
    data: {
      name: data.name,
      image: data.images[0] ?? '',
      price: data.price,
      discountRate: data.discountRate,
      discountStartTime: data.discountStartTime ? new Date(data.discountStartTime) : undefined,
      discountEndTime: data.discountEndTime ? new Date(data.discountEndTime) : undefined,
      categoryId: data.categoryId,
      storeId: store.id,
      stocks: {
        create: data.stocks.map((stock) => ({
          sizeId: String(stock.sizeId),
          quantity: stock.quantity,
        })),
      },
    },
    include: {
      stocks: { include: { size: true } },
      category: true,
    },
  });

  return createdProduct;
}

export async function findProductById(productId: string) {
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

export async function updateProduct(
  productId: string,
  data: Partial<{
    name: string;
    description: string;
    price: number;
    categoryId: string;
    discountRate?: number;
    discountStartTime?: string;
    discountEndTime?: string;
    tags?: string[];
    images?: string[];
  }>,
) {
  return await prismaClient.product.update({
    where: { id: productId },
    data: {
      ...data,
      discountStartTime: data.discountStartTime ? new Date(data.discountStartTime) : undefined,
      discountEndTime: data.discountEndTime ? new Date(data.discountEndTime) : undefined,
      image: data.images?.[0],
    },
  });
}

export async function deleteProduct(productId: string) {
  return await prismaClient.product.delete({
    where: { id: productId },
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
