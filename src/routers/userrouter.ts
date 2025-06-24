import express from 'express';
import * as authController from '../controllers/authControllers';
import asyncHandler from '../lib/asyncHandler';
import * as userControllers from '../controllers/userControllers';
import authMiddleware from '../middlewares/authMiddleware';
import multer from 'multer';
const upload = multer();

const router = express.Router();

console.log('✅ userrouter 연결됨');

router.post('/', asyncHandler(userControllers.register));
router.get('/me', authMiddleware, userControllers.getMyInfo);
router.patch('/me', authMiddleware, upload.none(), userControllers.updateMyInfo);
router.delete('/delete', authMiddleware, userControllers.deleteMyAccount);

export default router;
