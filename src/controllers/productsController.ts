import type { Request, Response, NextFunction } from 'express';
import * as productsService from '../services/productsService';
import * as reviewsService from '../services/reviewsSerivce';
import * as inquiriesSerivce from '../services/inquiriesService';
import BadRequestError from '../lib/errors/BadRequestError';
import NotFoundError from '../lib/errors/ProductNotFoundError';
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
import UnauthorizedError from '../lib/errors/UnauthorizedError';

export async function createProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const data = create(req.body, CreateProductBodyStruct);
    const createdProduct = await productsService.createProduct(data);
    res.status(201).send(createdProduct);
  } catch (err) {
    next(new BadRequestError((err as Error).message));
  }
}

export async function getProductList(req: Request, res: Response, next: NextFunction) {
  try {
    const params = req.query as ProductQuery;
    const { list, total, page } = await productsService.getProductList(params);
    res.status(200).json({ list, total, page });
  } catch (err) {
    next(err);
  }
}

export async function getProductDetail(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const product = await productsService.getProductDetail(id);
    if (!product) return next(new NotFoundError('product', id));
    res.send(product);
  } catch (err) {
    next(err);
  }
}

export async function updateProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const data = create(req.body, UpdateProductBodyStruct);
    const updated = await productsService.updateProduct(id, data);
    res.send(updated);
  } catch (err) {
    if (err instanceof NotFoundError) return next(err);
    next(new BadRequestError((err as Error).message));
  }
}

export async function deleteProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    await productsService.deleteProduct(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function createInquiry(req: Request, res: Response) {
  if (!req.user) {
    throw new UnauthorizedError('인증되지 않은 유저입니다.');
  }

  const { id: productId } = create({ id: req.params.productId }, IdParamsStruct);
  const data = create(req.body, CreateInquiryBodyStruct);
  const createdInquiry = await inquiriesSerivce.createInquiry({
    ...data,
    userId: req.user.id,
    productId,
  });
  res.status(201).send(createdInquiry);
}

export async function createReview(req: Request, res: Response) {
  if (!req.user) {
    throw new UnauthorizedError('인증되지 않은 유저입니다.');
  }
  const { id: productId } = create({ id: req.params.productId }, IdParamsStruct);
  const data = create(req.body, CreateReviewBodyStruct);
  const createdReview = await reviewsService.createReview({
    userId: req.user.id,
    productId,
    ...data,
  });
  res.status(201).send(reviewResponseDTO(createdReview));
}

export async function getInquiryList(req: Request, res: Response) {
  const { id: productId } = create({ id: req.params.productId }, IdParamsStruct);
  const inquiries = await inquiriesSerivce.getInquiryList(productId);
  res.send(inquiries);
}

export async function getReviewList(req: Request, res: Response) {
  const { id: productId } = create({ id: req.params.productId }, IdParamsStruct);
  const params = create(req.query, GetReviewListParamsStruct);
  const reviews = await reviewsService.getReviewList(productId, params);
  const result = reviews.map(reviewResponseDTO);
  res.send(result);
}
