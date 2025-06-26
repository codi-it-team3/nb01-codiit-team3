import { nullable, object, partial, string, optional } from 'superstruct';
import { CursorParamsStruct, PageParamsStruct } from './commonStructs';

export const UpdateMeBodyStruct = partial(
  object({
    email: string(),
    nickname: string(),
    image: nullable(string()),
  }),
);

export const UpdatePasswordBodyStruct = object({
  password: string(),
  newPassword: string(),
});

export const UpdateMyInfoBodyStruct = object({
  name: optional(string()),
  image: optional(string()),
  password: optional(string()),
  currentPassword: string(),
});

export const DeleteMyAccountBodyStruct = object({
  currentPassword: string(),
});

export const GetMyProductListParamsStruct = PageParamsStruct;
export const GetMyFavoriteListParamsStruct = PageParamsStruct;
export const GetMyNotificationsParamsStruct = CursorParamsStruct;
