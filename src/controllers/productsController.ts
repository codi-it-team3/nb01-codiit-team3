import type { Request, Response, NextFunction } from 'express';
import * as productsService from '../services/productsService';
import BadRequestError from '../lib/errors/BadRequestError';
import NotFoundError from '../lib/errors/NotFoundError';
import { CreateProductBodyStruct, UpdateProductBodyStruct } from '../structs/productsStruct';
import { create } from 'superstruct';
import { ProductQuery } from '../types/product';

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
