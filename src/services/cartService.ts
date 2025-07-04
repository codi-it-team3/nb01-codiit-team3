import {
  createCart,
  getCartList,
  updateCartItem,
  getStock,
  getCartItemList,
  deleteCartItem,
  getCartByBuyerId,
  getCartById,
  getCartItemById,
  getCartItem,
  getProductById,
  getSizeById,
} from '../repositories/cartRepository';
import BadRequestError from '../lib/errors/BadRequestError';
import NotFoundError from '../lib/errors/ProductNotFoundError';
import { UpdateCartItemData } from '../types/cart';

export const createCartService = async (buyerId: string) => {
  const existingCart = await getCartByBuyerId(buyerId);
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

  const product = await getProductById(productId);
  if (!product) throw new BadRequestError('존재하지 않는 상품입니다.');

  const size = await getSizeById(sizeId);
  if (!size) throw new BadRequestError('존재하지 않는 사이즈입니다.');

  const stock = await getStock(productId, sizeId);
  if (!stock) throw new BadRequestError('재고 정보가 존재하지 않습니다.');
  if (quantity > stock.quantity)
    throw new BadRequestError('해당 상품의 남은 재고 수량이 부족합니다.');

  const cart = await getCartById(cartId);
  if (!cart) throw new BadRequestError('장바구니가 존재하지 않습니다.');

  const existingItem = await getCartItem(cartId, productId, sizeId);
  if (existingItem && existingItem.quantity === quantity)
    throw new BadRequestError('동일한 상품이 이미 장바구니에 존재합니다.');

  return await updateCartItem(data);
};

export const getCartItemListService = async (cartItemId: string) => {
  const cartItem = await getCartItemList(cartItemId);
  if (!cartItem) throw new NotFoundError('장바구니 항목', cartItemId);

  return cartItem;
};

export const deleteCartItemService = async (cartItemId: string) => {
  const cartItem = await getCartItemById(cartItemId);

  if (!cartItem) {
    throw new NotFoundError('장바구니 항목', cartItemId);
  }

  return await deleteCartItem(cartItemId);
};
