import { Router } from 'express';
import * as storeController from '../controllers/storeController';
import { onlySeller } from '../middlewares/onlyMiddleware';
import authMiddleware from '../middlewares/authMiddleware';

const router = Router();

router.post('/', authMiddleware, onlySeller, storeController.createStore);
router.patch('/', authMiddleware, onlySeller, storeController.updateStore);
router.get('/detail/my', authMiddleware, onlySeller, storeController.getMyStoreDetail);
router.get('/:storeId', storeController.getStoreById);
router.get('/detail/my/product', authMiddleware, onlySeller, storeController.getMyStoreProductList);

export default router;
