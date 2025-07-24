import { Router } from 'express';
import {
  createCartController,
  getCartListController,
  getCartItemListController,
  updateCartItemController,
  deleteCartItemController,
} from '../controllers/cartController';
import authMiddleware from '../middlewares/authMiddleware';
import asyncHandler from '../lib/asyncHandler';
import { onlyBuyer } from '../middlewares/onlyMiddleware';

const cartRouter = Router();

cartRouter.post('/', authMiddleware, onlyBuyer, asyncHandler(createCartController));

cartRouter.get('/', authMiddleware, onlyBuyer, asyncHandler(getCartListController));

cartRouter.patch('/', authMiddleware, onlyBuyer, asyncHandler(updateCartItemController));

cartRouter.get('/:id', authMiddleware, onlyBuyer, asyncHandler(getCartItemListController));

cartRouter.delete('/:id', authMiddleware, onlyBuyer, asyncHandler(deleteCartItemController));

export default cartRouter;
