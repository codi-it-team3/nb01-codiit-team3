import { Router } from 'express';
import {
  createProduct,
  getProductList,
  getProductDetail,
  updateProduct,
  deleteProduct,
  createReview,
  getReviewList,
  createInquiry,
  getInquiryList,
} from '../controllers/productsController';
import { withAsync } from '../lib/withAsync';
import authMiddleware from '../middlewares/authMiddleware';
import { onlySeller } from '../middlewares/onlyMiddleware';

const router = Router();

router.post('/', authMiddleware, onlySeller, withAsync(createProduct));
router.patch('/:id', authMiddleware, onlySeller, withAsync(updateProduct));
router.delete('/:id', authMiddleware, onlySeller, withAsync(deleteProduct));

router.get('/', withAsync(getProductList));
router.get('/:id', withAsync(getProductDetail));

router.post('/:productId/inquiries', authMiddleware, withAsync(createInquiry));
router.get('/:productId/inquiries', authMiddleware, withAsync(getInquiryList));
router.post('/:productId/reviews', authMiddleware, withAsync(createReview));
router.get('/:productId/reviews', withAsync(getReviewList));

export default router;
