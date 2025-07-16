import express from 'express';
import { withAsync } from '../lib/withAsync';
import {
  createReply,
  deleteInquiry,
  getInquiry,
  getMyInquiryList,
  getReply,
  updateInquiry,
  updateReply,
} from '../controllers/inquiriesController';
import authMiddleware from '../middlewares/authMiddleware';

const inquiriesRouter = express.Router();

inquiriesRouter.get('/', authMiddleware, withAsync(getMyInquiryList));
inquiriesRouter.get('/:inquiryId', authMiddleware, withAsync(getInquiry));
inquiriesRouter.patch('/:inquiryId', authMiddleware, withAsync(updateInquiry));
inquiriesRouter.delete('/:inquiryId', authMiddleware, withAsync(deleteInquiry));
inquiriesRouter.post('/:inquiryId/replies', authMiddleware, withAsync(createReply));
inquiriesRouter.get('/:replyId/replies', authMiddleware, withAsync(getReply));
inquiriesRouter.patch('/:replyId/replies', authMiddleware, withAsync(updateReply));

export default inquiriesRouter;
