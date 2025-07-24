import * as storeRepository from '../repositories/storeRepository';
import ForbiddenError from '../lib/errors/ForbiddenError';
import ConflictError from '../lib/errors/ConflictError';
import NotFoundError from '../lib/errors/ProductNotFoundError';
import { CreateOrUpdateStoreInput } from '../types/store';
import dayjs from 'dayjs';

export const createStore = async (userId: string, data: CreateOrUpdateStoreInput) => {
  const existing = await storeRepository.findStoreByUserId(userId);
  if (existing) {
    throw new ConflictError('Store already exists for userId: ' + userId);
  }

  return storeRepository.createStore(userId, data);
};

export const updateStore = async (
  userId: string,
  storeId: string,
  data: CreateOrUpdateStoreInput,
) => {
  const store = await storeRepository.findStoreById(storeId);

  if (!store || store.userId !== userId) {
    throw new ForbiddenError(`Store 접근 권한 없음: ${storeId}`);
  }

  return storeRepository.updateStore(storeId, data);
};

export const getMyStoreDetail = async (userId: string) => {
  const store = await storeRepository.findStoreByUserId(userId);
  if (!store) {
    throw new NotFoundError('Store', userId);
  }

  const now = dayjs();
  const startOfMonth = now.startOf('month');

  const favoriteCount = store.favoriteBy.length;
  const monthFavoriteCount = store.favoriteBy.filter((fav) =>
    dayjs(fav.createdAt).isAfter(startOfMonth),
  ).length;
  const productCount = store.products.length;
  const totalSoldCount = store.SalesLog.reduce((acc, log) => acc + log.quantity, 0);

  return {
    ...store,
    favoriteCount,
    monthFavoriteCount,
    productCount,
    totalSoldCount,
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

export const favoriteStore = async (userId: string, storeId: string) => {
  const store = await storeRepository.findStoreById(storeId);
  if (!store) {
    throw new NotFoundError('Store', `ID ${storeId}인 스토어를 찾을 수 없습니다.`);
  }

  const alreadyFavorited = await storeRepository.checkFavoriteStore(userId, storeId);
  if (alreadyFavorited) {
    throw new ConflictError('이미 관심 등록한 스토어입니다.');
  }

  await storeRepository.createFavoriteStore(userId, storeId);
  return {
    type: 'register',
    store,
  };
};

export const unfavoriteStore = async (userId: string, storeId: string) => {
  const store = await storeRepository.findStoreById(storeId);
  if (!store) {
    throw new NotFoundError('Store', `ID ${storeId}인 스토어를 찾을 수 없습니다.`);
  }

  const alreadyFavorited = await storeRepository.checkFavoriteStore(userId, storeId);
  if (!alreadyFavorited) {
    throw new ConflictError('이미 관심 해제된 스토어입니다.');
  }

  await storeRepository.removeFavoriteStore(userId, storeId);
};
