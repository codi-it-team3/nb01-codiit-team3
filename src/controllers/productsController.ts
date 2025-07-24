import type { Request, Response } from 'express';
import * as productsService from '../services/productsService';
import { upsertProductView, getPopularProductList } from '../repositories/productsRepository';
import * as reviewsService from '../services/reviewsSerivce';
import * as inquiriesSerivce from '../services/inquiriesService';
import NotFoundError from '../lib/errors/ProductNotFoundError';
import UnauthorizedError from '../lib/errors/UnauthorizedError';
import {
  CreateInquiryBodyStruct,
  CreateProductBodyStruct,
  UpdateProductBodyStruct,
  CreateReviewBodyStruct,
  GetReviewListParamsStruct,
} from '../structs/productsStruct';
import { IdParamsStruct } from '../structs/commonStructs';
import { create } from 'superstruct';
import { ProductQuery } from '../types/product';
import reviewResponseDTO from '../dto/reviewResponseDTO';
import withAsync from '../lib/asyncHandler';

export const createProduct = withAsync(async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError('인증되지 않은 유저입니다.');
  const data = create(req.body, CreateProductBodyStruct);
  const createdProduct = await productsService.createProduct(data, req.user.id);
  res.status(201).send(createdProduct);
});

export const getProductList = withAsync(async (req: Request, res: Response) => {
  const params = req.query as ProductQuery;
  const { list, total, page, limit, totalPages } = await productsService.getProductList(
    params,
    req.user?.id,
  );
  res.status(200).json({ list, total, page, limit, totalPages });
});

export const getProductDetail = withAsync(async (req: Request, res: Response) => {
  const { id } = create({ id: req.params.id }, IdParamsStruct);
  const product = await productsService.getProductDetail(id);
  if (!product) throw new NotFoundError('product', id);
  if (req.user) {
    await upsertProductView(req.user.id, id);
  }

  res.send(product);
});

export const updateProduct = withAsync(async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError('인증되지 않은 유저입니다.');
  const { id } = create({ id: req.params.id }, IdParamsStruct);
  const data = create(req.body, UpdateProductBodyStruct);
  const updated = await productsService.updateProduct(id, data, req.user.id);
  res.send(updated);
});

export const deleteProduct = withAsync(async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError('인증되지 않은 유저입니다.');
  const { id } = create({ id: req.params.id }, IdParamsStruct);
  await productsService.deleteProduct(id, req.user.id);
  res.status(204).send();
});

export const createInquiry = withAsync(async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError('인증되지 않은 유저입니다.');
  const { id: productId } = create({ id: req.params.productId }, IdParamsStruct);
  const data = create(req.body, CreateInquiryBodyStruct);
  const createdInquiry = await inquiriesSerivce.createInquiry({
    ...data,
    userId: req.user.id,
    productId,
  });
  res.status(201).send(createdInquiry);
});

export const createReview = withAsync(async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError('인증되지 않은 유저입니다.');
  const { id: productId } = create({ id: req.params.productId }, IdParamsStruct);
  const data = create(req.body, CreateReviewBodyStruct);
  const createdReview = await reviewsService.createReview({
    userId: req.user.id,
    productId,
    ...data,
  });
  res.status(201).send(reviewResponseDTO(createdReview));
});

export const getInquiryList = withAsync(async (req: Request, res: Response) => {
  const { id: productId } = create({ id: req.params.productId }, IdParamsStruct);
  const inquiries = await inquiriesSerivce.getInquiryList(productId);
  res.send(inquiries);
});

export const getReviewList = withAsync(async (req: Request, res: Response) => {
  const { id: productId } = create({ id: req.params.productId }, IdParamsStruct);
  const params = create(req.query, GetReviewListParamsStruct);
  const reviews = await reviewsService.getReviewList(productId, params);
  const result = reviews.map(reviewResponseDTO);
  res.send(result);
});

export const getRecommendedProducts = withAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const recommended = userId
    ? await productsService.getRecommendedProducts(userId)
    : await productsService.getPopularProducts(4);
  res.status(200).send({ list: recommended });
});
