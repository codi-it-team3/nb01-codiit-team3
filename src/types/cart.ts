import { Prisma } from '@prisma/client';

export type CartList = Prisma.CartGetPayload<{
  include: {
    items: {
      include: {
        product: {
          include: {
            store: true;
            stocks: {
              include: {
                size: true;
              };
            };
          };
        };
      };
    };
  };
}>;

export type CartItemList = Prisma.CartItemGetPayload<{
  include: {
    product: {
      include: {
        store: true;
        stocks: {
          include: {
            size: true;
          };
        };
      };
    };
    cart: true;
  };
}>;

export type CartItemWithCart = Prisma.CartItemGetPayload<{
  include:{
    cart:true,
  }
}>

export type UpdateCartItemData = {
  cartId: string;
  productId: string;
  sizeId: string;
  quantity: number;
}


