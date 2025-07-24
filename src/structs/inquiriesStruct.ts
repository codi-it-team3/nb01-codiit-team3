import { assign, enums, nonempty, object, optional, partial, string } from 'superstruct';
import { PageSizeParamsStruct } from './commonStructs';
import { CreateInquiryBodyStruct } from './productsStruct';

export const GetMyInquiryListParamsStruct = assign(
  PageSizeParamsStruct,
  object({
    status: optional(enums(['WaitingAnswer', 'CompletedAnswer'])),
  }),
);

export const UpdateInquiryBodyStruct = partial(CreateInquiryBodyStruct);

export const CreateReplyBodyStruct = object({
  content: nonempty(string()),
});

export const UpdateReplyBodyStruct = partial(CreateReplyBodyStruct);
