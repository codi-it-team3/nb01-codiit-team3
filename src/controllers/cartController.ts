import { Request, Response } from 'express';
import {
  createCartService,
  getCartListService,
  updateCartItemService,
  getCartItemListService,
  deleteCartItemService,
} from '../services/cartService';
import { serializeCart, serializeCartItem } from '../lib/utils/serializeCart';
import { UpdateCartItemRequestDTO } from '../dto/cartDTO';
import { UpdateCartItemStruct } from '../structs/cartStruct';
import { validate } from 'superstruct';
import BadRequestError from '../lib/errors/BadRequestError';
import UnauthorizedError from '../lib/errors/UnauthorizedError';

export const createCartController = async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError('인증되지 않은 유저입니다.');
  const buyerId = req.user.id;
  const cart = await createCartService(buyerId);
  res.status(201).json(cart);
};

export const getCartListController = async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError('인증되지 않은 유저입니다.');
  const buyerId = req.user.id;

  const cart = await getCartListService(buyerId);
  const response = serializeCart(cart);

  res.status(200).json(response);
};

export const updateCartItemController = async (req: Request, res: Response) => {
  const [error] = validate(req.body, UpdateCartItemStruct);

  if (error) throw new BadRequestError(`요청 데이터가 유효하지 않습니다: ${error.message}`);

  const updateData: UpdateCartItemRequestDTO = req.body;
  const updatedItem = await updateCartItemService(updateData);
  if (!updatedItem) {
    return res
      .status(404)
      .json({ message: '장바구니 항목을 찾을 수 없거나 업데이트할 수 없습니다.' });
  }
  const response = serializeCartItem(updatedItem);
  res.status(200).json(response);
};

export const getCartItemListController = async (req: Request, res: Response) => {
  const cartItemId = req.params.id;
  const cartItem = await getCartItemListService(cartItemId);
  const response = serializeCartItem(cartItem);
  res.status(200).json(response);
};

export const deleteCartItemController = async (req: Request, res: Response) => {
  const cartItemId = req.params.id;

  await deleteCartItemService(cartItemId);
  res.status(204).send();
};
