import {
  createCart,
  getCartList,
  updateCartItem,
  getStocks,
  getCartItemList,
  deleteCartItem,
  getCartByBuyerId,
  getBuyerIdByCartId,
  getBuyerIdByCartItemId,
} from '../repositories/cartRepository';
import BadRequestError from '../lib/errors/BadRequestError';
import NotFoundError from '../lib/errors/ProductNotFoundError';
import ForbiddenError from '../lib/errors/ForbiddenError';
import { UpdateCartItemData } from '../types/cart';

export const createCartService = async (buyerId: string) => {
  if (!buyerId) throw new BadRequestError('buyerId가 존재하지 않습니다.');
  const existingCart = await getCartByBuyerId(buyerId);
  if (existingCart) return existingCart;

  return await createCart(buyerId);
};

export const getCartListService = async (buyerId: string, userId: string) => {
  if (!buyerId) throw new BadRequestError('buyerId가 존재하지 않습니다.');
  const cart = await getCartList(buyerId);

  if (!cart) throw new NotFoundError('장바구니', buyerId);

  if (buyerId !== userId) {
    throw new ForbiddenError('해당 장바구니 항목에 접근할 수 없습니다.');
  }

  return cart;
};

export const updateCartItemService = async (data: UpdateCartItemData, userId: string) => {
  const { cartId, productId, sizeId, quantity } = data;

  const stock = await getStocks(productId, sizeId);

  if (!stock) throw new BadRequestError('재고 정보가 존재하지 않습니다.');
  if (quantity > stock.quantity)
    throw new BadRequestError('해당 상품의 남은 재고 수량이 부족합니다.');

  const cart = await getBuyerIdByCartId(cartId);

  if (!cart) throw new BadRequestError('장바구니가 존재하지 않습니다.');
  if (cart.buyerId !== userId)
    throw new ForbiddenError('이 장바구니 항목을 수정할 권한이 없습니다.');
  return await updateCartItem(data);
};

export const getCartItemListService = async (cartItemId: string, userId: string) => {
  const cartItem = await getCartItemList(cartItemId);
  if (!cartItem) throw new NotFoundError('장바구니 항목', cartItemId);

  if (cartItem.cart.buyerId !== userId) {
    throw new ForbiddenError('해당 장바구니 항목에 접근할 수 없습니다.');
  }

  return cartItem;
};

export const deleteCartItemService = async (cartItemId: string, userId: string) => {
  const cartItem = await getBuyerIdByCartItemId(cartItemId);

  if (!cartItem) {
    throw new NotFoundError('장바구니 항목', cartItemId);
  }

  if (cartItem.cart.buyerId !== userId) {
    throw new ForbiddenError('이 장바구니 항목을 삭제할 권한이 없습니다.');
  }

  return await deleteCartItem(cartItemId);
};
