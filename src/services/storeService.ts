import * as storeRepository from '../repositories/storeRepository';
import ConflictError from '../lib/errors/ConflictError';
import NotFoundError from '../lib/errors/ProductNotFoundError';
import { CreateOrUpdateStoreInput } from '../types/store';

export const createStore = async (userId: string, data: CreateOrUpdateStoreInput) => {
  const existing = await storeRepository.findStoreByUserId(userId);
  if (existing) {
    throw new ConflictError('Store already exists for userId: ' + userId);
  }

  return storeRepository.createStore(userId, data);
};

export const updateStore = async (userId: string, data: CreateOrUpdateStoreInput) => {
  const store = await storeRepository.findStoreByUserId(userId);
  if (!store) {
    throw new NotFoundError('Store', userId);
  }

  return storeRepository.updateStore(store.id, data);
};

export const getMyStoreDetail = async (userId: string) => {
  const store = await storeRepository.findStoreByUserId(userId);
  if (!store) {
    throw new NotFoundError('Store', userId);
  }

  const favoriteCount = store.favoriteBy.length;
  const productCount = store.products.length;
  const totalSoldCount = store.SalesLog.reduce((acc, log) => acc + log.quantity, 0);
  const monthlyRevenue = store.MonthlyStoreSales[0]?.totalSales ?? 0;

  return {
    ...store,
    favoriteCount,
    productCount,
    totalSoldCount,
    monthlyRevenue,
  };
};

export const getStoreById = async (storeId: string) => {
  const store = await storeRepository.findStoreById(storeId);
  if (!store) {
    throw new NotFoundError('Store', storeId);
  }

  const favoriteCount = store.favoriteBy.length;

  return {
    ...store,
    favoriteCount,
  };
};

export const getMyStoreProductList = async (userId: string, page?: number, pageSize?: number) => {
  const store = await storeRepository.findStoreByUserId(userId);
  if (!store) {
    throw new NotFoundError('Store', userId);
  }

  const result = await storeRepository.getMyStoreProductList(userId, { page, pageSize });
  return result;
};
