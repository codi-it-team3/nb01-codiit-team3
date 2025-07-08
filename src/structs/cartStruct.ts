import { object, string, min, number } from 'superstruct';

export const UpdateCartItemStruct = object({
  cartId: string(),
  productId: string(),
  sizeId: string(),
  quantity: min(number(), 1),
});
