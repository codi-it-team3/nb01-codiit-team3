import { Alarm } from '@prisma/client';
import { prismaClient } from '../lib/prismaClient';

export async function getNotificationsByUserId(userId: string) {
  const notifications = await prismaClient.alarm.findMany({
    where: { userId },
  });
  return notifications;
}

export async function getNotificationById(id: string) {
  const notification = await prismaClient.alarm.findUnique({
    where: { id },
  });
  return notification;
}

export async function updateNotificationById(id: string, data: Partial<Alarm>) {
  await prismaClient.alarm.update({
    where: { id },
    data,
  });
}
