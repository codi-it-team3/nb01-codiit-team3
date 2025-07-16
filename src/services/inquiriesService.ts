import Inquiry from '../types/Inquiry';
import * as productsRepository from '../repositories/productsRepository';
import * as inquiriesRepository from '../repositories/inquiriesRepository';
import BadRequestError from '../lib/errors/BadRequestError';
import { MyInquiryPaginationParams } from '../types/pagination';

type CreateInquiryData = Omit<Inquiry, 'id' | 'status' | 'createdAt' | 'updatedAt'>;
type UpdateInquiryData = Partial<CreateInquiryData>;

export async function createInquiry(data: CreateInquiryData) {
  const existingProduct = await productsRepository.getProductById(data.productId);
  if (!existingProduct) {
    throw new BadRequestError('요청한 리소스를 찾을 수 없습니다.');
  }

  const createdInquiry = await inquiriesRepository.createInquiry(data);
  return createdInquiry;
}

export async function getInquiryList(productId: string) {
  const existingProduct = await productsRepository.getProductById(productId);
  if (!existingProduct) {
    throw new BadRequestError('요청한 리소스를 찾을 수 없습니다.');
  }

  const inquiries = await inquiriesRepository.getInquiryListByProductId(productId);
  return inquiries;
}

export async function getMyInquiryList(userId: string, params: MyInquiryPaginationParams) {
  const myInquiries = await inquiriesRepository.getMyInquiryList(userId, params);
  return myInquiries;
}

export async function getInquiry(inquiryId: string) {
  const existingInquiry = await inquiriesRepository.getInquiryById(inquiryId);
  if (!existingInquiry) {
    throw new BadRequestError('요청한 리소스를 찾을 수 없습니다.');
  }

  const inquiry = await inquiriesRepository.getInquiryWithReply(inquiryId);
  return inquiry;
}

export async function updateInquiry(inquiryId: string, data: UpdateInquiryData) {
  const existingInquiry = await inquiriesRepository.getInquiryById(inquiryId);
  if (!existingInquiry) {
    throw new BadRequestError('요청한 리소스를 찾을 수 없습니다.');
  }

  const updatedInquiry = await inquiriesRepository.updateInquiry(inquiryId, data);
  return updatedInquiry;
}

export async function deleteInquiry(inquiryId: string) {
  const existingInquiry = await inquiriesRepository.getInquiryById(inquiryId);
  if (!existingInquiry) {
    throw new BadRequestError('요청한 리소스를 찾을 수 없습니다.');
  }

  await inquiriesRepository.deleteInquiry(inquiryId);
}
