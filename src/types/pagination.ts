import { Infer } from 'superstruct';
import { PageParamsStruct, PageSizeParamsStruct } from '../structs/commonStructs';
import { GetMyInquiryListParamsStruct } from '../structs/inquiriesStruct';

export type PagePaginationParams = Infer<typeof PageParamsStruct>;
export type PageSizePaginationParams = Infer<typeof PageSizeParamsStruct>;
export type MyInquiryPaginationParams = Infer<typeof GetMyInquiryListParamsStruct>;
