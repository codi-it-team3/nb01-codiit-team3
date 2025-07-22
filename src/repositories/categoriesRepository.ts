import { CategoryName } from '@prisma/client';
import { prismaClient } from '../lib/prismaClient';

export async function getCategoryByName(name: CategoryName) {
  const category = await prismaClient.category.findFirst({
    where: { name },
  });
  return category;
}
