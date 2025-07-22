import BadRequestError from '../lib/errors/BadRequestError';
import ForbiddenError from '../lib/errors/ForbiddenError';
import UnauthorizedError from '../lib/errors/UnauthorizedError';
import * as notificationsRepository from '../repositories/notificationsRepository';

export async function getMyNotifications(userId: string) {
  if (!userId) {
    throw new UnauthorizedError('Unauthorized');
  }

  const notifications = await notificationsRepository.getNotificationsByUserId(userId);
  return notifications;
}

export async function checkNotificationById(alarmId: string, userId?: string) {
  if (!userId) {
    throw new UnauthorizedError('Unauthorized');
  }

  const notification = await notificationsRepository.getNotificationById(alarmId);
  if (!notification) {
    throw new BadRequestError('요청한 리소스를 찾을 수 없습니다.');
  }

  if (notification.userId !== userId) {
    throw new ForbiddenError("Cannot read other user's notification");
  }

  await notificationsRepository.updateNotificationById(alarmId, { isChecked: true });
}
