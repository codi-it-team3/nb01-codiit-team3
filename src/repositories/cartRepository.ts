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

export const updateCartItem = async (
  updateCartItem: UpdateCartItemData,
): Promise<CartItemList | null> => {
  const { cartId, productId, sizeId, quantity } = updateCartItem;

  const existingItem = await getCartItem(cartId, productId, sizeId);

  if (existingItem) {
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
  } else {
    return await prismaClient.cartItem.create({
      data: {
        cartId,
        productId,
        sizeId,
        quantity,
      },
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
  }
};

export const getStock = async (productId: string, sizeId: string) => {
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

export const getCartItem = async (cartId: string, productId: string, sizeId: string) => {
  return await prismaClient.cartItem.findUnique({
    where: { cartId_productId_sizeId: { cartId, productId, sizeId } },
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

export const getCartItemById = async (cartItemId: string) => {
  return await prismaClient.cartItem.findUnique({
    where: { id: cartItemId },
  });
};

export const getCartById = async (cartId: string) => {
  return await prismaClient.cart.findUnique({
    where: { id: cartId },
  });
};

export const getProductById = async (productId: string) => {
  return await prismaClient.product.findUnique({
    where: { id: productId },
  });
};

export const getSizeById = async (sizeId: string) => {
  return await prismaClient.size.findUnique({
    where: { id: sizeId },
  });
};
