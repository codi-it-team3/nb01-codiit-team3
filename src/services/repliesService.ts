import Reply from '../types/Reply';
import * as inquiriesRepository from '../repositories/inquiriesRepository';
import * as repliesRepository from '../repositories/repliesRepository';
import BadRequestError from '../lib/errors/BadRequestError';
import ConflictError from '../lib/errors/ConflictError';

type CreateReplyData = Omit<Reply, 'id' | 'createdAt' | 'updatedAt'> & { userId?: string };
type UpdateReplyData = Partial<CreateReplyData>;

export async function createReply(data: CreateReplyData) {
  const existingInquiry = await inquiriesRepository.getInquiryById(data.inquiryId);
  if (!existingInquiry) {
    throw new BadRequestError('요청한 리소스를 찾을 수 없습니다.');
  }

  const existingReply = await repliesRepository.getReplyByInquiryId(data.inquiryId);
  if (existingReply) {
    throw new ConflictError('이미 해당 문의에 대한 답변이 존재합니다.');
  }

  const createdReply = await repliesRepository.createReply(data);
  return createdReply;
}

export async function getReply(replyId: string) {
  const existingReply = await repliesRepository.getReplyByid(replyId);
  if (!existingReply) {
    throw new BadRequestError('요청한 리소스를 찾을 수 없습니다.');
  }

  const inquiry = await inquiriesRepository.getInquiryWithReply(existingReply.inquiryId);
  if (!inquiry) {
    throw new BadRequestError('요청한 리소스를 찾을 수 없습니다.');
  }

  return inquiry;
}

export async function updateReply(replyId: string, data: UpdateReplyData) {
  const existingReply = await repliesRepository.getReplyByid(replyId);
  if (!existingReply) {
    throw new BadRequestError('요청한 리소스를 찾을 수 없습니다.');
  }

  const updatedReply = await repliesRepository.updateReply(replyId, data);
  return updatedReply;
}
