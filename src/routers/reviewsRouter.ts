import express from 'express';
import { updateReview, deleteReview, getReview } from '../controllers/reviewsController';
import { withAsync } from '../lib/withAsync';
import authMiddleware from '../middlewares/authMiddleware';

const reviewsRouter = express.Router();

reviewsRouter.patch('/:reviewId', authMiddleware, withAsync(updateReview));
reviewsRouter.delete('/:reviewId', authMiddleware, withAsync(deleteReview));
reviewsRouter.get('/:reviewId', authMiddleware, withAsync(getReview));

export default reviewsRouter;
