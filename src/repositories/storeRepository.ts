import { prismaClient } from '../lib/prismaClient';
import { CreateOrUpdateStoreInput } from '../types/store';

export const createStore = async (userId: string, data: CreateOrUpdateStoreInput) => {
  const userExists = await prismaClient.user.findUnique({ where: { id: userId } });
  if (!userExists) {
    throw new Error(`User ${userId} does not exist`);
  }

  return prismaClient.store.create({
    data: {
      userId,
      name: data.name,
      address: data.address,
      detailAddress: data.detailAddress,
      phoneNumber: data.phoneNumber,
      content: data.content,
      ...(data.image !== undefined && { image: data.image }),
    },
  });
};

export const updateStore = async (storeId: string, data: CreateOrUpdateStoreInput) => {
  return prismaClient.store.update({
    where: { id: storeId },
    data: {
      name: data.name,
      address: data.address,
      detailAddress: data.detailAddress,
      phoneNumber: data.phoneNumber,
      content: data.content,
      ...(data.image !== undefined && { image: data.image }),
    },
  });
};

export const findStoreByUserId = async (userId: string) => {
  return prismaClient.store.findUnique({
    where: { userId },
    include: {
      favoriteBy: true,
      products: true,
      SalesLog: true,
      MonthlyStoreSales: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });
};

export const findStoreById = async (storeId: string) => {
  return prismaClient.store.findUnique({
    where: { id: storeId },
    include: {
      favoriteBy: true,
    },
  });
};

export const getMyStoreProductList = async (
  userId: string,
  { page = 1, pageSize = 10 }: { page?: number; pageSize?: number },
) => {
  const skip = (page - 1) * pageSize;

  const [list, totalCount] = await Promise.all([
    prismaClient.product.findMany({
      where: { store: { userId } },
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        price: true,
        image: true,
        discountRate: true,
        discountStartTime: true,
        discountEndTime: true,
        createdAt: true,
      },
    }),
    prismaClient.product.count({
      where: { store: { userId } },
    }),
  ]);

  return { list, totalCount };
};
