import NotFoundError from '../lib/errors/NotFoundError';
import { prismaClient } from '../lib/prismaClient';
import { User, Grade } from '@prisma/client';

export async function findbyEmail(email: string) {
  const user = await prismaClient.user.findUnique({
    where: { email },
  });
  return user;
}

export async function createUser(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) {
  const createdUser = await prismaClient.user.create({
    data,
    include: {
      grade: true,
    },
  });
  return createdUser;
}

export async function getUser(id: string): Promise<(User & { grade: Grade }) | null> {
  return await prismaClient.user.findUnique({
    where: { id },
    include: { grade: true },
  });
}

export async function updateUser(id: string, data: Partial<User>): Promise<User> {
  const updatedUser = await prismaClient.user.update({
    where: { id },
    data,
    include: { grade: true },
  });
  return updatedUser;
}

export async function deleteUser(id: string) {
  await prismaClient.user.delete({
    where: { id },
  });
}

export function findById(findById: any) {
  throw new Error('Function not implemented.');
}
