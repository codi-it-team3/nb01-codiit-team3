import { coerce, integer, object, string, number, min, array, defaulted, optional, enums, nonempty, refine } from 'superstruct';
import { PaymentStatus } from '@prisma/client';

const phoneRegex = /^010-\d{4}-\d{4}$/;
const Phone = refine(string(), 'Phone', (value) => phoneRegex.test(value));

const OrderItem = object({
  productId: nonempty(string()),
  sizeId: nonempty(string()),
  quantity: min(number(),1),
})

export const CreateOrderStuct = object({
  name: nonempty(string()),
  phoneNumber: nonempty(Phone),
  address: nonempty(string()),
  orderItems: array(OrderItem),
  usePoint: defaulted(number(),0),
})

export const UpdateOrderStruct = CreateOrderStuct

const integerString = coerce(integer(), string(), (value) => parseInt(value));

export const OrderParamsStruct = object({
  page: defaulted(integerString, 1),
  pageSize: defaulted(integerString, 10),
  orderBy: optional(enums(['recent', 'oldest'])),
  status: optional(enums(Object.values(PaymentStatus))),
});

export const OrderIdStruct = string();
