import { Router } from 'express';
import {
  createProduct,
  getProductList,
  getProductDetail,
  updateProduct,
  deleteProduct,
} from '../controllers/productsController';
import { withAsync } from '../lib/withAsync';

const router = Router();

router.post('/', withAsync(createProduct));
router.get('/', withAsync(getProductList));
router.get('/:id', withAsync(getProductDetail));
router.patch('/:id', withAsync(updateProduct));
router.delete('/:id', withAsync(deleteProduct));

export default router;
