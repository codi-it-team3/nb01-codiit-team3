import express from 'express';
import * as authController from '../controllers/authControllers';
import asyncHandler from '../lib/asyncHandler';
import authMiddleware from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/login', asyncHandler(authController.login));
router.post('/refresh', asyncHandler(authController.refreshToken));
router.post('/logout', authMiddleware, asyncHandler(authController.logout));

export default router;
