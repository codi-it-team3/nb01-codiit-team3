import { Request, Response } from 'express';
import * as inquiriesService from '../services/inquiriesService';
import * as repliesService from '../services/repliesService';
import {
  CreateReplyBodyStruct,
  GetMyInquiryListParamsStruct,
  UpdateInquiryBodyStruct,
  UpdateReplyBodyStruct,
} from '../structs/inquiriesStruct';
import { create } from 'superstruct';
import { IdParamsStruct } from '../structs/commonStructs';
import UnauthorizedError from '../lib/errors/UnauthorizedError';

export async function getMyInquiryList(req: Request, res: Response) {
  if (!req.user) {
    throw new UnauthorizedError('인증되지 않은 유저입니다.');
  }

  const params = create(req.query, GetMyInquiryListParamsStruct);
  const myInquiries = await inquiriesService.getMyInquiryList(req.user.id, params);
  res.send(myInquiries);
}

export async function getInquiry(req: Request, res: Response) {
  const { id: inquiryId } = create({ id: req.params.inquiryId }, IdParamsStruct);
  const inquiry = await inquiriesService.getInquiry(inquiryId);
  res.send(inquiry);
}

export async function updateInquiry(req: Request, res: Response) {
  const { id: inquiryId } = create({ id: req.params.inquiryId }, IdParamsStruct);
  const data = create(req.body, UpdateInquiryBodyStruct);
  const updatedInquiry = await inquiriesService.updateInquiry(inquiryId, data);
  res.send(updatedInquiry);
}

export async function deleteInquiry(req: Request, res: Response) {
  const { id: inquiryId } = create({ id: req.params.inquiryId }, IdParamsStruct);
  await inquiriesService.deleteInquiry(inquiryId);
  res.status(204).send();
}

export async function createReply(req: Request, res: Response) {
  if (!req.user) {
    throw new UnauthorizedError('인증되지 않은 유저입니다.');
  }

  const { id: inquiryId } = create({ id: req.params.inquiryId }, IdParamsStruct);
  const data = create(req.body, CreateReplyBodyStruct);
  const createdReply = await repliesService.createReply({
    ...data,
    userId: req.user.id,
    inquiryId,
  });
  res.send(createdReply);
}

export async function getReply(req: Request, res: Response) {
  const { id: replyId } = create({ id: req.params.replyId }, IdParamsStruct);
  const reply = await repliesService.getReply(replyId);
  res.send(reply);
}

export async function updateReply(req: Request, res: Response) {
  const { id: replyId } = create({ id: req.params.replyId }, IdParamsStruct);
  const data = create(req.body, UpdateReplyBodyStruct);
  const updatedReply = await repliesService.updateReply(replyId, data);
  res.send(updatedReply);
}
