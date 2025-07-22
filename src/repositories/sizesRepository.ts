import { prismaClient } from '../lib/prismaClient';

export async function getSizeList() {
  const sizes = await prismaClient.size.findMany();
  return sizes;
}

export async function getSizeById(id: string) {
  const size = await prismaClient.size.findUnique({
    where: { id },
  });
  return size;
}
