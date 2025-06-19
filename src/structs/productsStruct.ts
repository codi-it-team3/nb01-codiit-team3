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
} from 'superstruct';

export const CreateProductBodyStruct = object({
  name: coerce(nonempty(string()), string(), (v) => v.trim()),
  price: min(integer(), 0),
  storeId: nonempty(string()),
  categoryId: nonempty(string()),
  stocks: array(
    object({
      sizeId: integer(),
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

export const IdParamsStruct = object({
  id: nonempty(string()),
});
