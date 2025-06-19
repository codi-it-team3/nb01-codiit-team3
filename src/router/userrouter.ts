import express from 'express';
import * as authController from '../controllers/authControllers';
import asyncHandler from '../lib/asyncHandler';
import * as userControllers from '../controllers/userControllers'

const router = express.Router();

router.post('/register', asyncHandler(userControllers.register));   

export default router;