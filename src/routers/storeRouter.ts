import { Router } from 'express';
import * as storeController from '../controllers/storeController';
import { onlyBuyer, onlySeller } from '../middlewares/onlyMiddleware';
import authMiddleware from '../middlewares/authMiddleware';

const router = Router();

router.post('/', authMiddleware, onlySeller, storeController.createStore);
router.patch('/:storeId', authMiddleware, onlySeller, storeController.updateStore);
router.get('/detail/my', authMiddleware, onlySeller, storeController.getMyStoreDetail);
router.get('/detail/my/product', authMiddleware, onlySeller, storeController.getMyStoreProductList);
router.post('/:storeId/favorite', authMiddleware, onlyBuyer, storeController.favoriteStore);
router.delete('/:storeId/favorite', authMiddleware, onlyBuyer, storeController.unfavoriteStore);
router.get('/:storeId', storeController.getStoreById);

export default router;
