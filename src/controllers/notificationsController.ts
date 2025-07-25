import { Request, Response } from 'express';
import { create } from 'superstruct';
import { IdParamsStruct } from '../structs/commonStructs';
import * as notificationsService from '../services/notificationsService';
import UnauthorizedError from '../lib/errors/UnauthorizedError';

export async function notificationsSSE(req: Request, res: Response) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const sendNotifications = async () => {
    if (!req.user) {
      throw new UnauthorizedError('인증되지 않은 유저입니다.');
    }
    const notifications = await notificationsService.getMyNotifications(req.user.id);
    res.write(`data: ${JSON.stringify(notifications)}\n\n`);
  };

  await sendNotifications();

  const intervalId = setInterval(sendNotifications, 30000);

  req.on('close', () => {
    clearInterval(intervalId);
    res.end();
  });
}

export async function getMyNotifications(req: Request, res: Response) {
  if (!req.user) {
    throw new UnauthorizedError('인증되지 않은 유저입니다.');
  }
  const notifications = await notificationsService.getMyNotifications(req.user.id);
  res.send(notifications);
}

export async function checkNotification(req: Request, res: Response) {
  const { id: alarmId } = create({ id: req.params.alarmId }, IdParamsStruct);
  await notificationsService.checkNotificationById(alarmId, req.user?.id);
  res.status(200).send();
}
