import {
  object,
  string,
  integer,
  min,
  array,
  nonempty,
  optional,
  partial,
  coerce,
  boolean,
} from 'superstruct';
import { PageParamsStruct } from './commonStructs';

export const CreateProductBodyStruct = object({
  name: coerce(nonempty(string()), string(), (v) => v.trim()),
  price: min(integer(), 0),
  storeId: nonempty(string()),
  categoryId: nonempty(string()),
  image: nonempty(string()),
  content: nonempty(string()),
  discountRate: optional(min(integer(), 0)),
  discountStartTime: optional(string()),
  discountEndTime: optional(string()),
  stocks: array(
    object({
      sizeId: nonempty(string()),
      quantity: min(integer(), 0),
    }),
  ),
});

export const UpdateProductBodyStruct = partial(CreateProductBodyStruct);

export const GetProductListParamsStruct = object({
  name: optional(string()),
  categoryId: optional(string()),
  storeId: optional(string()),
  sizeId: optional(string()),
  sort: optional(string()),
  page: optional(coerce(min(integer(), 1), string(), Number)),
  limit: optional(coerce(min(integer(), 1), string(), Number)),
});

export const CreateInquiryBodyStruct = object({
  title: nonempty(string()),
  content: nonempty(string()),
  isSecret: boolean(),
});

export const CreateReviewBodyStruct = object({
  rating: min(integer(), 0),
  content: nonempty(string()),
  orderItemId: nonempty(string()),
});

export const GetReviewListParamsStruct = PageParamsStruct;
