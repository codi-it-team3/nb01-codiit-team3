import type { Request, Response, NextFunction } from 'express';
import * as productsService from '../services/productsService';
import BadRequestError from '../lib/errors/BadRequestError';
import NotFoundError from '../lib/errors/NotFoundError';
import { CreateProductDto, UpdateProductDto, ProductQuery } from '../dto/productDTO';

export async function createProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const data = req.body as CreateProductDto;

    if (
      !data.name ||
      !data.price ||
      !data.storeId ||
      !data.categoryId ||
      !Array.isArray(data.stocks) ||
      data.stocks.length === 0 ||
      !data.image ||
      !data.content
    ) {
      return next(new BadRequestError('invalid product fields'));
    }

    const createdProduct = await productsService.createProduct(data);
    res.status(201).send(createdProduct);
  } catch (err) {
    next(err);
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
    const data = req.body as UpdateProductDto;
    const updated = await productsService.updateProduct(id, data);

    res.send(updated);
  } catch (err) {
    next(err);
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
