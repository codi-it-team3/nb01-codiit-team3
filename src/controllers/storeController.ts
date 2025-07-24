import { Request, Response } from 'express';
import * as storeService from '../services/storeService';
import {
  CreateStoreBodyStruct,
  UpdateStoreBodyStruct,
  GetMyProductListQueryStruct,
} from '../structs/storeStruct';
import { object, string, nonempty, create } from 'superstruct';
import withAsync from '../lib/asyncHandler';

const StoreIdParamsStruct = object({
  storeId: nonempty(string()),
});

export const createStore = withAsync(async (req: Request, res: Response) => {
  const value = create(req.body, CreateStoreBodyStruct);
  const { id: userId } = req.user!;
  const store = await storeService.createStore(userId, value);
  res.status(201).json(store);
});

export const updateStore = withAsync(async (req: Request, res: Response) => {
  const { storeId } = create({ storeId: req.params.storeId }, StoreIdParamsStruct);
  const value = create(req.body, UpdateStoreBodyStruct);
  const { id: userId } = req.user!;
  const store = await storeService.updateStore(userId, storeId, value);
  res.status(200).json(store);
});

export const getMyStoreDetail = withAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.user!;
  const store = await storeService.getMyStoreDetail(userId);
  res.status(200).json(store);
});

export const getStoreById = withAsync(async (req: Request, res: Response) => {
  const { storeId } = create({ storeId: req.params.storeId }, StoreIdParamsStruct);
  const store = await storeService.getStoreById(storeId);
  res.status(200).json(store);
});

export const getMyStoreProductList = withAsync(async (req: Request, res: Response) => {
  const value = create(req.query, GetMyProductListQueryStruct);
  const { id: userId } = req.user!;
  const result = await storeService.getMyStoreProductList(userId, value.page, value.pageSize);
  res.status(200).json(result);
});

export const favoriteStore = withAsync(async (req: Request, res: Response) => {
  const { storeId } = create({ storeId: req.params.storeId }, StoreIdParamsStruct);
  const { id: userId } = req.user!;
  const result = await storeService.favoriteStore(userId, storeId);
  res.status(201).json(result);
});

export const unfavoriteStore = withAsync(async (req: Request, res: Response) => {
  const { storeId } = create({ storeId: req.params.storeId }, StoreIdParamsStruct);
  const { id: userId } = req.user!;
  await storeService.unfavoriteStore(userId, storeId);
  res.status(204).send();
});
