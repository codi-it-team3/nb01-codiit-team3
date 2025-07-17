import { Request, Response } from 'express';
import {
  createOrderService,
  deleteOrderService,
  getOrderByIdService,
  getOrderListService,
  updateOrderService,
} from '../services/orderService';
import { CreateOrderStuct, OrderParamsStruct, UpdateOrderStruct } from '../structs/orderStructs';
import { create } from 'superstruct';
import { serializeOrder } from '../lib/utils/serializeOrder';
import UnauthorizedError from '../lib/errors/UnauthorizedError';
import BadRequestError from '../lib/errors/BadRequestError';
import { validate } from 'superstruct';
import { OrderRequestDTO, OrderUpdateRequestDTO } from '../dto/orderDTO';

export const createOrderController = async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError('인증되지 않은 유저입니다.');
  const userId = req.user.id;

  const [error] = validate(req.body, CreateOrderStuct);

  if (error) throw new BadRequestError(`요청 데이터가 유효하지 않습니다: ${error.message}`);

  const orderData: OrderRequestDTO = {
    ...req.body,
    userId,
  };
  const createdOrder = await createOrderService(orderData, userId);
  const reponse = serializeOrder(createdOrder);
  res.status(201).json(reponse);
};

export const getOrderListController = async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError('인증되지 않은 유저입니다.');
  const userId = req.user.id;

  const params = create(req.query, OrderParamsStruct);
  const order = await getOrderListService(userId, params);
  res.status(200).json(order);
};

export const getOrderByIdController = async (req: Request, res: Response) => {
  const orderId = req.params.id;
  const order = await getOrderByIdService(orderId);
  res.status(200).json(order);
};

export const updateOrderController = async (req: Request, res: Response) => {
  const [error] = validate(req.body, UpdateOrderStruct);

  if (error) throw new BadRequestError(`요청 데이터가 유효하지 않습니다: ${error.message}`);

  const updateData:OrderUpdateRequestDTO = req.body;
  if (!req.user) throw new UnauthorizedError('인증되지 않은 유저입니다.');

  const userId = req.user.id;
  const orderId = req.params.id;

  const updateOrder = await updateOrderService(updateData, orderId, userId);
  const response = serializeOrder(updateOrder);
  res.status(200).json(response);
};

export const deleteOrderController = async (req: Request, res: Response) => {
  const orderId = req.params.id;

  await deleteOrderService(orderId);
  return res.status(204).send();
};
