import { Router } from 'express';
import {
  createOrderController,
  deleteOrderController,
  getOrderByIdController,
  getOrderListController,
  updateOrderController,
} from '../controllers/orderController';
import authMiddleware from '../middlewares/authMiddleware';
import asyncHandler from '../lib/asyncHandler';
import { onlyBuyer } from '../middlewares/onlyMiddleware';

const orderRouter = Router();

orderRouter.post('/', authMiddleware, onlyBuyer, asyncHandler(createOrderController));
orderRouter.get('/', authMiddleware, onlyBuyer, asyncHandler(getOrderListController));
orderRouter.get('/:id', authMiddleware, onlyBuyer, asyncHandler(getOrderByIdController));
orderRouter.patch('/:id', authMiddleware, onlyBuyer, asyncHandler(updateOrderController));
orderRouter.delete('/:id', authMiddleware, onlyBuyer, asyncHandler(deleteOrderController));

export default orderRouter;
