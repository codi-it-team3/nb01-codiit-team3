import { Router } from 'express';
import {
  createProduct,
  getProductList,
  getProductDetail,
  updateProduct,
  deleteProduct,
} from '../controllers/productsController';

const router = Router();

router.post('/', createProduct);
router.get('/', getProductList);
router.get('/:id', getProductDetail);
router.patch('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;
