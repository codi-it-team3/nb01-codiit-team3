import { Request, Response } from 'express';
import {
  createOrderService,
  deleteOrderService,
  getOrderByIdService,
  getOrderListService,
  updateOrderService,
} from '../services/orderService';
import {
  CreateOrderStuct,
  OrderIdStruct,
  OrderParamsStruct,
  UpdateOrderStruct,
} from '../structs/orderStructs';
import { serializeOrder } from '../lib/utils/serializeOrder';
import UnauthorizedError from '../lib/errors/UnauthorizedError';
import BadRequestError from '../lib/errors/BadRequestError';
import { validate, create } from 'superstruct';
import { OrderRequestDTO, OrderUpdateRequestDTO } from '../dto/orderDTO';

export const createOrderController = async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError('인증되지 않은 유저입니다.');
  const userId = req.user.id;

  const [bodyError] = validate(req.body, CreateOrderStuct);

  if (bodyError) throw new BadRequestError(`요청 데이터가 유효하지 않습니다: ${bodyError.message}`);

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
  const orderId = create(req.params.id, OrderIdStruct);

  const order = await getOrderByIdService(orderId);
  res.status(200).json(order);
};

export const updateOrderController = async (req: Request, res: Response) => {
  const [bodyError] = validate(req.body, UpdateOrderStruct);

  if (bodyError) throw new BadRequestError(`요청 데이터가 유효하지 않습니다: ${bodyError.message}`);

  const updateData: OrderUpdateRequestDTO = req.body;
  if (!req.user) throw new UnauthorizedError('인증되지 않은 유저입니다.');

  const userId = req.user.id;
  const [paramError, orderId] = validate(req.params.id, OrderIdStruct);
  if (paramError)
    throw new BadRequestError(`요청 데이터가 유효하지 않습니다: ${paramError.message}`);

  const updateOrder = await updateOrderService(updateData, orderId, userId);
  const response = serializeOrder(updateOrder);
  res.status(200).json(response);
};

export const deleteOrderController = async (req: Request, res: Response) => {
  const [paramError, orderId] = validate(req.params.id, OrderIdStruct);
  if (paramError)
    throw new BadRequestError(`요청 데이터가 유효하지 않습니다: ${paramError.message}`);

  await deleteOrderService(orderId);
  return res.status(204).send();
};
