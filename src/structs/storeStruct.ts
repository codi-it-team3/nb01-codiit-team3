import {
  object,
  string,
  size,
  nonempty,
  integer,
  coerce,
  min,
  unknown,
  defaulted,
  optional,
} from 'superstruct';

export const CreateStoreBodyStruct = object({
  name: size(nonempty(string()), 1, 50),
  address: size(nonempty(string()), 1, 100),
  detailAddress: size(nonempty(string()), 1, 100),
  phoneNumber: size(nonempty(string()), 8, 20),
  content: size(nonempty(string()), 1, 1000),
  image: optional(nonempty(string())),
});

export const UpdateStoreBodyStruct = CreateStoreBodyStruct;

export const GetMyProductListQueryStruct = object({
  page: defaulted(coerce(min(integer(), 1), unknown(), Number), 1),
  pageSize: defaulted(coerce(min(integer(), 1), unknown(), Number), 10),
});
