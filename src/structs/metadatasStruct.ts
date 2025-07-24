import { enums, object, optional } from 'superstruct';

export const GetCategoryParamsStruct = object({
  name: enums(['TOP', 'BOTTOM', 'DRESS', 'OUTER', 'SKIRT', 'SHOES', 'ACC']),
});
