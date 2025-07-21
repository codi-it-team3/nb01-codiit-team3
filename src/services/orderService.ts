import {
  PaginationParams,
  PaginatedOrderList,
  UpdateOrderData,
  CreateOrder,
} from '../types/order';
import {
  createOrder,
  findUserId,
  findProductByPrice,
  getOrderList,
  getOrderById,
  updateOrder,
  deleteOrder,
  findPaymentByStatus,
  findOrderById,
  decreaseStock,
  decreaseUserPoint,
  createSalesLogs,
  rewardUserPoint,
} from '../repositories/orderRepository';
import BadRequestError from '../lib/errors/BadRequestError';
import NotFoundError from '../lib/errors/ProductNotFoundError';
import { PaymentStatus } from '@prisma/client';
import { prismaClient } from '../lib/prismaClient';

export const createOrderService = async (data: CreateOrder, userId: string) => {
  const user = await findUserId(userId);
  if (!user) throw new BadRequestError('유저 정보가 존재하지 않습니다');
  if (user.points < data.usePoint) throw new BadRequestError('포인트가 부족합니다.');

  return await prismaClient.$transaction(async (tx) => {
    for (const item of data.orderItems) {
      const success = await decreaseStock(tx, item);
      if (!success) throw new BadRequestError('재고가 부족합니다');
    }

    if (data.usePoint > 0) {
      const success = await decreaseUserPoint(tx, data.userId, data.usePoint);
      if (!success) throw new BadRequestError('포인트가 부족합니다');
    }
    const priceMap = await findProductByPrice(
      tx,
      data.orderItems.map((item) => item.productId),
    );

    const subtotal = data.orderItems.reduce((sum, item) => {
      const price = priceMap[item.productId];
      if (price == null) throw new BadRequestError('상품 가격이 없습니다.');
      return sum + price * item.quantity;
    }, 0);

    const totalQuantity = data.orderItems.reduce((sum, item) => sum + item.quantity, 0);

    const order = await createOrder(tx, {
      ...data,
      subtotal,
      totalQuantity,
      priceMap,
    });

    const salesLogData = order.orderItems.map((item) => ({
      productId: item.productId,
      storeId: item.product.storeId,
      userId: order.userId,
      price: item.price,
      quantity: item.quantity,
      soldAt: new Date(),
    }));
    await createSalesLogs(tx, salesLogData);

    await rewardUserPoint(tx, userId, subtotal);

    return order;
  });
};

export const getOrderListService = async (
  userId: string,
  params: PaginationParams,
): Promise<PaginatedOrderList> => {
  return await getOrderList(userId, params);
};

export const getOrderByIdService = async (orderId: string) => {
  if (!orderId) throw new NotFoundError('order', orderId);

  return await getOrderById(orderId);
};

export const updateOrderService = async (
  updateData: UpdateOrderData,
  orderId: string,
  userId: string,
) => {
  return await prismaClient.$transaction(async(tx)=>{
const existingOrder = await findOrderById(tx, orderId);
  if (!existingOrder) {
    throw new NotFoundError('주문', orderId);
  }
  
  if (updateData.usePoint > 0) {
      const success = await decreaseUserPoint(tx, userId, updateData.usePoint);
      if (!success) throw new BadRequestError('포인트가 부족합니다');
    }

  const productId = updateData.orderItems.map((item) => item.productId);
  const priceMap = await findProductByPrice(tx, productId);

  for (const item of updateData.orderItems) {
    if (priceMap[item.productId] == null) {
      throw new NotFoundError('상품 가격', item.productId);
    }
  }
  return await updateOrder(tx, updateData, orderId, priceMap);
  })
  
};

export const deleteOrderService = async (orderId: string) => {
  const order = await findPaymentByStatus(orderId);
  if (!order) throw new NotFoundError('orderId', orderId);
  const paymentStatus = order.payments?.status;
  if (paymentStatus !== PaymentStatus.WaitingPayment)
    throw new BadRequestError('결제가 대기중인 상태에서만 삭제가 가능합니다.');
  return await deleteOrder(orderId);
};
