import {prismaClient} from '../lib/prismaClient'
import { User } from '@prisma/client'

export async function findbyEmail(email: string) {
  const user = await prismaClient.user.findUnique({
    where: { email },
  });
  return user;
}
 
export async function createUser(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) {
  const createdUser = await prismaClient.user.create({
    data,
  });
  return createdUser;
}

export async function getUser(id : string){
  const user = await prismaClient.user.findUnique({
    where : {id},
  });
  return user;
}
 

export async function updateUser(id: string, data: Partial<User>) {
  const updatedUser = await prismaClient.user.update({
    where: { id },
    data,
  });
  return updatedUser;
}

export async function deleteUser(id: string) {
  await prismaClient.user.delete({
    where: { id },
  });
}
