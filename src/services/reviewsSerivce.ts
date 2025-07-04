import BadRequestError from '../lib/errors/BadRequestError';
import ConflictError from '../lib/errors/ConflictError';
import * as reviewsRepository from '../repositories/reviewsRepository';
import { PagePaginationParams } from '../types/pagination';
import Review from '../types/Review';

type CreateReviewData = Omit<Review, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateReviewData = Partial<Pick<CreateReviewData, 'rating' | 'content'>>;

export async function createReview(data: CreateReviewData) {
  const existingReview = await reviewsRepository.getReviewByOrderItemId(data.orderItemId);
  if (existingReview) {
    throw new ConflictError('이미 이 주문에 대한 리뷰가 존재합니다.');
  }

  const review = await reviewsRepository.createReview(data);
  return review;
}

export async function getReviewList(productId: string, params: PagePaginationParams) {
  const reviews = await reviewsRepository.getReviewList(productId, params);
  return reviews;
}

export async function updateReview(reviewId: string, data: UpdateReviewData) {
  const existingReview = await reviewsRepository.getReviewById(reviewId);
  if (!existingReview) {
    throw new BadRequestError('요청한 리소스를 찾을 수 없습니다.');
  }

  const updatedReview = await reviewsRepository.updateReview(reviewId, data);
  return updatedReview;
}

export async function deleteReview(reviewId: string) {
  const existingReview = await reviewsRepository.getReviewById(reviewId);
  if (!existingReview) {
    throw new BadRequestError('요청한 리소스를 찾을 수 없습니다.');
  }

  await reviewsRepository.deleteReview(reviewId);
}

export async function getReview(reviewId: string) {
  const existingReview = await reviewsRepository.getReviewById(reviewId);
  if (!existingReview) {
    throw new BadRequestError('요청한 리소스를 찾을 수 없습니다.');
  }
  return existingReview;
}
