import { Request, Response } from 'express';
import { create } from 'superstruct';
import { IdParamsStruct } from '../structs/commonStructs';
import { UpdateReviewBodyStruct } from '../structs/reviewsStructs';
import * as reviewsService from '../services/reviewsSerivce';
import reviewResponseDTO from '../dto/reviewResponseDTO';

export async function updateReview(req: Request, res: Response) {
  const { id: reviewId } = create({ id: req.params.reviewId }, IdParamsStruct);
  const data = create(req.body, UpdateReviewBodyStruct);
  const updatedReview = await reviewsService.updateReview(reviewId, data);
  res.status(201).send(reviewResponseDTO(updatedReview));
}

export async function deleteReview(req: Request, res: Response) {
  const { id: reviewId } = create({ id: req.params.reviewId }, IdParamsStruct);
  await reviewsService.deleteReview(reviewId);
  res.status(200).send({ message: '리뷰를 삭제 했습니다.' });
}

export async function getReview(req: Request, res: Response) {
  const { id: reviewId } = create({ id: req.params.reviewId }, IdParamsStruct);
  const review = await reviewsService.getReview(reviewId);
  res.send(reviewResponseDTO(review));
}
