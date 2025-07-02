import { prismaClient } from '../lib/prismaClient';
import { CartItemList, CartList, UpdateCartItemData } from '../types/cart';

export const createCart = async (buyerId: string) => {
  return await prismaClient.cart.create({
    data: { buyerId },
  });
};

export const getCartList = async (buyerId: string): Promise<CartList | null> => {
  return await prismaClient.cart.findUnique({
    where: { buyerId },
    include: {
      items: {
        include: {
          product: {
            include: {
              store: true,
              stocks: {
                include: { size: true },
              },
            },
          },
        },
      },
    },
  });
};

export const updateCartItem = async (updateCartItem: UpdateCartItemData): Promise<CartItemList | null> => {
  const { cartId, productId, sizeId, quantity } = updateCartItem;

  return await prismaClient.cartItem.update({
    where: {
      cartId_productId_sizeId: { cartId, productId, sizeId },
    },
    data: { quantity },
    include: {
      product: {
        include: {
          store: true,
          stocks: {
            include: { size: true },
          },
        },
      },
      cart: true,
    },
  });
};

export const getStocks = async (productId: string, sizeId: string) => {
  return prismaClient.stock.findUnique({
    where: {
      productId_sizeId: {
        productId,
        sizeId,
      },
    },
    select: {
      quantity: true,
    },
  });
};

export const getCartItemList = async (cartItemId: string): Promise<CartItemList | null> => {
  return await prismaClient.cartItem.findUnique({
    where: { id: cartItemId },
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
      cart: true,
    },
  });
};

export const deleteCartItem = async (cartItemId: string) => {
  return prismaClient.cartItem.delete({
    where: { id: cartItemId },
  });
};

export const getCartByBuyerId = async (buyerId: string) => {
  return await prismaClient.cart.findUnique({
    where: { buyerId },
  });
};

export const getBuyerIdByCartId = async (cartId: string) => {
  return await prismaClient.cart.findUnique({
    where: { id: cartId },
    select: { buyerId: true },
  });
};

export const getBuyerIdByCartItemId = async (cartItemId: string) => {
  return await prismaClient.cartItem.findUnique({
    where: { id: cartItemId },
    select: {
      cart: {
        select: { buyerId: true },
      },
    },
  });
};
