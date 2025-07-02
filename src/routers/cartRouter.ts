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
const cartRouter = Router();

cartRouter.post('/', authMiddleware, asyncHandler(createCartController));

cartRouter.get('/', authMiddleware, asyncHandler(getCartListController));

cartRouter.patch('/', authMiddleware, asyncHandler(updateCartItemController));

cartRouter.get('/:id', authMiddleware, asyncHandler(getCartItemListController));

cartRouter.delete('/:id', authMiddleware, asyncHandler(deleteCartItemController));

export default cartRouter;
