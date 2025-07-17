import { Request, Response, NextFunction } from 'express';
import * as storeService from '../services/storeService';
import {
  CreateStoreBodyStruct,
  UpdateStoreBodyStruct,
  GetMyProductListQueryStruct,
} from '../structs/storeStruct';
import { create } from 'superstruct';

export const createStore = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const value = create(req.body, CreateStoreBodyStruct);
    const { id: userId } = req.user!;
    const store = await storeService.createStore(userId, value);
    res.status(201).json(store);
  } catch (err) {
    next(err);
  }
};

export const updateStore = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const value = create(req.body, UpdateStoreBodyStruct);
    const { id: userId } = req.user!;
    const store = await storeService.updateStore(userId, value);
    res.status(200).json(store);
  } catch (err) {
    next(err);
  }
};

export const getMyStoreDetail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: userId } = req.user!;
    const store = await storeService.getMyStoreDetail(userId);
    res.status(200).json(store);
  } catch (err) {
    next(err);
  }
};

export const getStoreById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const storeId = req.params.storeId;
    const store = await storeService.getStoreById(storeId);
    res.status(200).json(store);
  } catch (err) {
    next(err);
  }
};

export const getMyStoreProductList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const value = create(req.query, GetMyProductListQueryStruct);
    const { id: userId } = req.user!;
    const result = await storeService.getMyStoreProductList(userId, value.page, value.pageSize);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
