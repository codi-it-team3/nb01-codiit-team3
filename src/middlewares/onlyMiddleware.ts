import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../lib/asyncHandler';
import ForbiddenError from '../lib/errors/ForbiddenError';

export const onlySeller = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.type !== 'SELLER') {
    throw new ForbiddenError('판매자만 접근 가능합니다.');
  }
  next();
});

export const onlyBuyer = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.type !== 'BUYER') {
    throw new ForbiddenError('구매자만 접근 가능합니다.');
  }
  next();
});
