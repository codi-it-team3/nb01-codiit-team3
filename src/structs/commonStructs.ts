import { coerce, integer, object, string, defaulted, optional, enums, nonempty } from 'superstruct';

/** Convert string to integer then validate it */
const integerString = coerce(integer(), string(), (value) => parseInt(value));

export const IdParamsStruct = object({
  id: nonempty(string()),
});

export const PageParamsStruct = object({
  page: defaulted(integerString, 1),
  limit: defaulted(integerString, 10),
});

export const PageSizeParamsStruct = object({
  page: defaulted(integer(), 1),
  pageSize: defaulted(integer(), 10),
});

export const CursorParamsStruct = object({
  cursor: defaulted(integerString, 0),
  limit: defaulted(integerString, 10),
  orderBy: optional(enums(['recent'])),
  keyword: optional(nonempty(string())),
});
