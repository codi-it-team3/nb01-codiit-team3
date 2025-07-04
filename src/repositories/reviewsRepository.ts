import { Review } from '@prisma/client';
import { prismaClient } from '../lib/prismaClient';
import { PagePaginationParams } from '../types/pagination';

export async function createReview(data: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>) {
  const createdReview = await prismaClient.review.create({
    data,
  });
  return createdReview;
}

export async function getReviewByOrderItemId(orderItemId: string) {
  const review = await prismaClient.review.findUnique({
    where: { orderItemId },
  });
  return review;
}

export async function getReviewById(id: string) {
  const review = await prismaClient.review.findUnique({
    where: { id },
  });
  return review;
}

export async function getReviewList(productId: string, { page, limit }: PagePaginationParams) {
  const reviews = await prismaClient.review.findMany({
    skip: (page - 1) * limit,
    take: limit,
    where: { productId },
  });
  return reviews;
}

export async function updateReview(id: string, data: Partial<Review>) {
  const updatedReview = await prismaClient.review.update({
    where: { id },
    data,
  });
  return updatedReview;
}

export async function deleteReview(id: string) {
  await prismaClient.review.delete({
    where: { id },
  });
}
