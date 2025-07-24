import express from 'express';
import { withAsync } from '../lib/withAsync';
import {
  checkNotification,
  getMyNotifications,
  notificationsSSE,
} from '../controllers/notificationsController';
import authMiddleware from '../middlewares/authMiddleware';

const notificationsRouter = express.Router();

notificationsRouter.get('/sse', authMiddleware, withAsync(notificationsSSE));
notificationsRouter.get('/', authMiddleware, withAsync(getMyNotifications));
notificationsRouter.patch('/:alarmId/check', authMiddleware, withAsync(checkNotification));

export default notificationsRouter;
