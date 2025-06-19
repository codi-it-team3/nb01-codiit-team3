import express from 'express';
import * as authController from '../controllers/authControllers';
import asyncHandler from '../lib/asyncHandler'; 

const router = express.Router();
 
router.post('/login', asyncHandler(authController.login)); 
router.post('/logout', asyncHandler(authController.logout));

export default router;