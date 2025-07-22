import { Prisma } from '@prisma/client';
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
  tx: Prisma.TransactionClient,
  updateCartItem: UpdateCartItemData,
): Promise<CartItemList | null> => {
  const { cartId, productId, sizeId, quantity } = updateCartItem;
  const existingItem = await findCartItem(tx, cartId, productId, sizeId);

  if (existingItem) {
    return await tx.cartItem.update({
      where: {
        cartId_productId_sizeId: { cartId, productId, sizeId },
      },
      data: { quantity },
      include: {
        product: {
          include: {
            store: true,
            stocks: { include: { size: true } },
          },
        },
        cart: true,
      },
    });
  } else {
    return await tx.cartItem.create({
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
            stocks: { include: { size: true } },
          },
        },
        cart: true,
      },
    });
  }
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

export const findStock = async (productId: string, sizeId: string) => {
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

export const findCartByBuyerId = async (buyerId: string) => {
  return await prismaClient.cart.findUnique({
    where: { buyerId },
  });
};

export const findCartItemById = async (cartItemId: string) => {
  return await prismaClient.cartItem.findUnique({
    where: { id: cartItemId },
  });
};

export const findCartById = async (cartId: string) => {
  return await prismaClient.cart.findUnique({
    where: { id: cartId },
  });
};

export const findProductById = async (productId: string) => {
  return await prismaClient.product.findUnique({
    where: { id: productId },
  });
};

export const findCartItem = async (
  tx: Prisma.TransactionClient,
  cartId: string,
  productId: string,
  sizeId: string,
) => {
  return await tx.cartItem.findUnique({
    where: {
      cartId_productId_sizeId: { cartId, productId, sizeId },
    },
  });
};

export const findSizeById = async (sizeId: string) => {
  return await prismaClient.size.findUnique({
    where: { id: sizeId },
  });
};
