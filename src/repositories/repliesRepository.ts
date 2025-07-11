import { Reply } from '@prisma/client';
import { prismaClient } from '../lib/prismaClient';

export async function createReply(data: Omit<Reply, 'id' | 'createdAt' | 'updatedAt'>) {
  const createdReply = await prismaClient.reply.create({
    data,
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
  return createdReply;
}

export async function getReplyByInquiryId(inquiryId: string) {
  const reply = await prismaClient.reply.findUnique({
    where: { inquiryId },
  });
  return reply;
}

export async function getReplyByid(id: string) {
  const reply = await prismaClient.reply.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
  return reply;
}

export async function updateReply(id: string, data: Partial<Reply>) {
  const updatedReply = await prismaClient.reply.update({
    where: { id },
    data,
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
  return updatedReply;
}
