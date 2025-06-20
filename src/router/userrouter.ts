import express from 'express';
import * as authController from '../controllers/authControllers';
import asyncHandler from '../lib/asyncHandler';
import * as userControllers from '../controllers/userControllers'
import authMiddleware from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/register', asyncHandler(userControllers.register));   
router.get('/me', authMiddleware, userControllers.getMyInfo);
router.patch('/me', authMiddleware, userControllers.updateMyInfo);
router.delete('/me', authMiddleware, userControllers.updateMyInfo);

export default router;