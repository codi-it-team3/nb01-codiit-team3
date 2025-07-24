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

const router = Router();

router.post('/', withAsync(createProduct));
router.get('/', withAsync(getProductList));
router.get('/:id', withAsync(getProductDetail));
router.patch('/:id', withAsync(updateProduct));
router.delete('/:id', withAsync(deleteProduct));

router.post('/:productId/inquiries', authMiddleware, withAsync(createInquiry));
router.get('/:productId/inquiries', authMiddleware, withAsync(getInquiryList));
router.post('/:productId/reviews', authMiddleware, withAsync(createReview));
router.get('/:productId/reviews', authMiddleware, withAsync(getReviewList));

export default router;
