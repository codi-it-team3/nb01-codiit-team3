import { CreateOrder, PaginationParams, PaginatedOrderList, updateOrderData } from '../types/order';
import {
  createOrder,
  findUserId,
  findProductByPrice,
  getOrderList,
  getOrderById,
  updateOrder,
  findUsePoint,
  deleteOrder,
  findPaymentByStatus,
  findOrderById,
} from '../repositories/orderRepository';
import BadRequestError from '../lib/errors/BadRequestError';
import NotFoundError from '../lib/errors/ProductNotFoundError';
import { PaymentStatus } from '@prisma/client';

export const createOrderService = async (data: CreateOrder, userId: string) => {
  const user = await findUserId(data.userId);
  if (!user) throw new BadRequestError('유저 정보가 존재하지 않습니다');
  if (user.points < data.usePoint) throw new BadRequestError('포인트가 부족합니다');

  const priceMap = await findProductByPrice(data.orderItems.map((item) => item.productId));

  const currentUsePoint = await findUsePoint(userId);
  if (currentUsePoint === null) throw new NotFoundError('user', userId);
  if (data.usePoint > currentUsePoint)
    throw new BadRequestError('사용할 수 있는 포인트를 초과했습니다.');

  const subtotal = data.orderItems.reduce((sum, item) => {
    const price = priceMap[item.productId];
    if (price == null) throw new BadRequestError('상품 가격이 없습니다.');
    return sum + price * item.quantity;
  }, 0);

  const totalQuantity = data.orderItems.reduce((sum, item) => sum + item.quantity, 0);

  return await createOrder({
    ...data,
    subtotal,
    totalQuantity,
    priceMap,
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
  updateData: updateOrderData,
  orderId: string,
  userId: string,
) => {
  const existingOrder = await findOrderById(orderId);
  if (!existingOrder) {
    throw new NotFoundError('주문', orderId);
  }
  const currentUsePoint = await findUsePoint(userId);
  if (currentUsePoint === null) throw new NotFoundError('user', userId);
  if (updateData.usePoint > currentUsePoint)
    throw new BadRequestError('사용할 수 있는 포인트를 초과했습니다.');

  const productId = updateData.orderItems.map((item) => item.productId);
  const priceMap = await findProductByPrice(productId);

  if (Object.keys(priceMap).length === 0)
    throw new NotFoundError('product price', productId.join(', '));
  for (const item of updateData.orderItems) {
    if (priceMap[item.productId] == null) {
      throw new NotFoundError('상품 가격', item.productId);
    }
  }
  return await updateOrder(updateData, orderId, priceMap);
};

export const deleteOrderService = async (orderId: string) => {
  const order = await findPaymentByStatus(orderId);
  if (!order) throw new NotFoundError('orderId', orderId);
  const paymentStatus = order.payments?.status;
  if (paymentStatus !== PaymentStatus.WaitingPayment)
    throw new BadRequestError('결제가 대기중인 상태에서만 삭제가 가능합니다.');
  return await deleteOrder(orderId);
};
