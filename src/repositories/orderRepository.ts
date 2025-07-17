import { prismaClient } from '../lib/prismaClient';
import { PaymentStatus } from '@prisma/client';
import {
  CreateOrderWithExtras,
  OrderList,
  PaginatedOrderList,
  PaginationParams,
  updateOrderData,
} from '../types/order';

export const findUserId = async (userId: string) => {
  const user = await prismaClient.user.findUnique({
    where: { id: userId },
  });
  return user;
};

export const findProductByPrice = async (productId: string[]) => {
  const product = await prismaClient.product.findMany({
    where: { id: { in: productId } },
    select: { id: true, price: true },
  });
  return product.reduce<Record<string, number>>((acc, cur) => {
    acc[cur.id] = cur.price;
    return acc;
  }, {});
};

export const createOrder = async (data: CreateOrderWithExtras) => {
  return await prismaClient.$transaction(async (tx) => {
    for (const item of data.orderItems) {
      const updated = await tx.stock.updateMany({
        where: {
          productId: item.productId,
          sizeId: item.sizeId,
          quantity: { gte: item.quantity },
        },
        data: {
          quantity: {
            decrement: item.quantity,
          },
        },
      });
      if (updated.count === 0) {
        throw new Error('재고가 부족합니다');
      }
    }

    if (data.usePoint > 0) {
      const updated = await tx.user.updateMany({
        where: {
          id: data.userId,
          points: { gte: data.usePoint },
        },
        data: {
          points: { decrement: data.usePoint },
        },
      });
      if (updated.count === 0) {
        throw new Error('포인트가 부족합니다.');
      }
    }

    const order = await tx.order.create({
      data: {
        user: { connect: { id: data.userId } },
        name: data.name,
        phoneNumber: data.phoneNumber,
        address: data.address,
        subtotal: data.subtotal,
        totalQuantity: data.totalQuantity,
        usePoint: data.usePoint,
        orderItems: {
          create: data.orderItems.map((item) => {
            const price = data.priceMap[item.productId];
            if (price == null) throw new Error('상품 가격을 찾을 수 없습니다');
            return {
              product: { connect: { id: item.productId } },
              size: { connect: { id: item.sizeId } },
              quantity: item.quantity,
              price: price,
            };
          }),
        },
        payments: {
          create: {
            price: data.subtotal - data.usePoint,
            status: PaymentStatus.CompletedPayment,
          },
        },
      },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                store: true,
                stocks: {
                  include: {
                    size: true,
                  },
                },
              },
            },
            size: true,
          },
        },
        payments: true,
      },
    });
    const salesLogData = order.orderItems.map((item) => ({
      productId: item.productId,
      storeId: item.product.storeId,
      userId: order.userId,
      price: item.price,
      quantity: item.quantity,
      soldAt: new Date(),
    }));
    await tx.salesLog.createMany({
      data: salesLogData,
    });
    return order;
  });
};

export const getOrderList = async (
  userId: string,
  { page, pageSize, status = PaymentStatus.CompletedPayment, orderBy }: PaginationParams,
): Promise<PaginatedOrderList> => {
  const order = orderBy === 'oldest' ? 'asc' : 'desc';

  const [orders, total] = await Promise.all([
    prismaClient.order.findMany({
      where: {
        userId,
        ...(status && {
          payments: {
            status: status,
          },
        }),
      },
      orderBy: { createdAt: order },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                store: true,
                stocks: {
                  include: {
                    size: true,
                  },
                },
              },
            },
            size: true,
          },
        },
        payments: true,
      },
    }),
    prismaClient.order.count({
      where: {
        userId,
        ...(status && {
          payments: {
            status: status,
          },
        }),
      },
    }),
  ]);
  const totalPages = Math.ceil(total / pageSize);

  return {
    data: orders,
    meta: {
      limit: pageSize,
      page,
      total,
      totalPages,
    },
  };
};

export const getOrderById = async (orderId: string): Promise<OrderList | null> => {
  return await prismaClient.order.findUnique({
    where: { id: orderId },
    include: {
      orderItems: {
        include: {
          product: {
            include: {
              store: true,
              stocks: {
                include: {
                  size: true,
                },
              },
            },
          },
          size: true,
        },
      },
      payments: true,
    },
  });
};

export const updateOrder = async (
  updateData: updateOrderData,
  orderId: string,
  priceMap: Record<string, number>,
): Promise<OrderList> => {
  return await prismaClient.$transaction(async (tx) => {
    return await tx.order.update({
      where: { id: orderId },
      data: {
        name: updateData.name,
        phoneNumber: updateData.phoneNumber,
        address: updateData.address,
        usePoint: updateData.usePoint,
        orderItems: {
          deleteMany: {},
          create: updateData.orderItems.map((item) => ({
            product: { connect: { id: item.productId } },
            size: { connect: { id: item.sizeId } },
            quantity: item.quantity,
            price: priceMap[item.productId],
          })),
        },
      },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                store: true,
                stocks: {
                  include: {
                    size: true,
                  },
                },
              },
            },
            size: true,
          },
        },
        payments: true,
      },
    });
  });
};

export const findOrderById = async (orderId: string) => {
  return await prismaClient.order.findUnique({
    where: { id: orderId },
  });
};

export const findUsePoint = async (userId: string): Promise<number | null> => {
  const user = await prismaClient.user.findUnique({
    where: { id: userId },
    select: {
      points: true,
    },
  });
  return user ? user.points : null;
};

export const deleteOrder = async (orderId: string) => {
  return await prismaClient.order.delete({
    where: { id: orderId },
  });
};

export const findPaymentByStatus = async (orderId: string) => {
  return await prismaClient.order.findUnique({
    where: { id: orderId },
    include: {
      payments: {
        select: {
          status: true,
        },
      },
    },
  });
};
