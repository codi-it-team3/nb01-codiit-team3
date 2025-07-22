import {
  createCart,
  getCartList,
  updateCartItem,
  findStock,
  getCartItemList,
  deleteCartItem,
  findCartByBuyerId,
  findCartById,
  findCartItemById,
  findProductById,
  findSizeById,
  findCartItem,
} from '../repositories/cartRepository';
import BadRequestError from '../lib/errors/BadRequestError';
import NotFoundError from '../lib/errors/ProductNotFoundError';
import { UpdateCartItemData } from '../types/cart';
import { prismaClient } from '../lib/prismaClient';

export const createCartService = async (buyerId: string) => {
  const existingCart = await findCartByBuyerId(buyerId);
  if (existingCart) return existingCart;

  return await createCart(buyerId);
};

export const getCartListService = async (buyerId: string) => {
  const cart = await getCartList(buyerId);

  if (!cart) throw new NotFoundError('장바구니', buyerId);

  return cart;
};

export const updateCartItemService = async (data: UpdateCartItemData) => {
  const { cartId, productId, sizeId, quantity } = data;

  const product = await findProductById(productId);
  if (!product) throw new BadRequestError('존재하지 않는 상품입니다.');

  const size = await findSizeById(sizeId);
  if (!size) throw new BadRequestError('존재하지 않는 사이즈입니다.');

  const stock = await findStock(productId, sizeId);
  if (!stock) throw new BadRequestError('재고 정보가 존재하지 않습니다.');
  if (quantity > stock.quantity)
    throw new BadRequestError('해당 상품의 남은 재고 수량이 부족합니다.');

  const cart = await findCartById(cartId);
  if (!cart) throw new BadRequestError('장바구니가 존재하지 않습니다.');

  return await prismaClient.$transaction(async (tx) => {
    const existingItem = await findCartItem(tx, cartId, productId, sizeId);
    if (existingItem && existingItem.quantity === quantity)
      throw new BadRequestError('동일한 상품이 이미 장바구니에 존재합니다.');

    return await updateCartItem(tx, data);
  });
};

export const getCartItemListService = async (cartItemId: string) => {
  const cartItem = await getCartItemList(cartItemId);
  if (!cartItem) throw new NotFoundError('장바구니 항목', cartItemId);

  return cartItem;
};

export const deleteCartItemService = async (cartItemId: string) => {
  const cartItem = await findCartItemById(cartItemId);

  if (!cartItem) {
    throw new NotFoundError('장바구니 항목', cartItemId);
  }

  return await deleteCartItem(cartItemId);
};
