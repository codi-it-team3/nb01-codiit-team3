import express from 'express';
import { withAsync } from '../lib/withAsync';
import { getCategory, getGradeList, getSizeList } from '../controllers/metadatasController';
import authMiddleware from '../middlewares/authMiddleware';

const metadatasRouter = express.Router();

metadatasRouter.get('/size', authMiddleware, withAsync(getSizeList));
metadatasRouter.get('/category/:name', authMiddleware, withAsync(getCategory));
metadatasRouter.get('/grade', authMiddleware, withAsync(getGradeList));

export default metadatasRouter;
