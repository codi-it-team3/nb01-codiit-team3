import { prismaClient } from '../lib/prismaClient';
import { PaymentStatus, Prisma } from '@prisma/client';
import {
  CreateOrderWithExtras,
  OrderList,
  PaginatedOrderList,
  PaginationParams,
  SalesLogs,
  UpdateOrderData,
} from '../types/order';

export const createOrder = async (tx: Prisma.TransactionClient, data: CreateOrderWithExtras) => {
  return await tx.order.create({
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
          return {
            product: { connect: { id: item.productId } },
            size: { connect: { id: item.sizeId } },
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
  tx: Prisma.TransactionClient,
  updateData: UpdateOrderData,
  orderId: string,
  priceMap: Record<string, number>,
): Promise<OrderList> => {
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
};

export const deleteOrder = async (orderId: string) => {
  return await prismaClient.order.delete({
    where: { id: orderId },
  });
};

export const decreaseStock = async (
  tx: Prisma.TransactionClient,
  item: { productId: string; sizeId: string; quantity: number },
) => {
  const updated = await tx.stock.updateMany({
    where: {
      productId: item.productId,
      sizeId: item.sizeId,
      quantity: { gte: item.quantity },
    },
    data: {
      quantity: { decrement: item.quantity },
    },
  });
  return updated.count > 0;
};

export const decreaseUserPoint = async (
  tx: Prisma.TransactionClient,
  userId: string,
  usePoint: number,
) => {
  const updated = await tx.user.updateMany({
    where: {
      id: userId,
      points: { gte: usePoint },
    },
    data: {
      points: { decrement: usePoint },
    },
  });
  return updated.count > 0;
};

export const findProductByPrice = async (tx: Prisma.TransactionClient, productIds: string[]) => {
  const products = await tx.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, price: true },
  });

  return products.reduce<Record<string, number>>((acc, cur) => {
    acc[cur.id] = cur.price;
    return acc;
  }, {});
};

export const createSalesLogs = async (tx: Prisma.TransactionClient, logs: SalesLogs) => {
  await tx.salesLog.createMany({
    data: logs,
  });
};

export const rewardUserPoint = async (
  tx: Prisma.TransactionClient,
  userId: string,
  orderAmount: number,
) => {
  const result = await tx.salesLog.aggregate({
    where: { userId },
    _sum: { price: true },
  });

  const totalSpent = (result._sum.price ?? 0) + orderAmount;

  const grade = await tx.grade.findFirst({
    where: { minAmount: { lte: totalSpent } },
    orderBy: { minAmount: 'desc' },
  });

  const pointRate = grade?.rate ?? 0;
  const point = Math.floor((orderAmount * pointRate) / 100);

  const user = await tx.user.findUnique({
    where: { id: userId },
    select: { gradeId: true },
  });

  const isGradeChanged = grade?.id && grade.id !== user?.gradeId;

  await tx.user.update({
    where: { id: userId },
    data: {
      points: { increment: point },
      ...(isGradeChanged && { gradeId: grade.id }),
    },
  });
  return point;
};

export const findUserId = async (userId: string) => {
  const user = await prismaClient.user.findUnique({
    where: { id: userId },
  });
  return user;
};

export const findOrderById = async (tx: Prisma.TransactionClient, orderId: string) => {
  return await tx.order.findUnique({
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
