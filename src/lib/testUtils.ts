import { PrismaClient } from '@prisma/client';

export async function clearDatabase(prismaClient: PrismaClient) {
  await prismaClient.reply.deleteMany();
  await prismaClient.inquiry.deleteMany();
  await prismaClient.review.deleteMany();
  await prismaClient.cartItem.deleteMany();
  await prismaClient.orderItem.deleteMany();
  await prismaClient.payment.deleteMany();
  await prismaClient.order.deleteMany();
  await prismaClient.alarm.deleteMany();
  await prismaClient.salesLog.deleteMany();

  await prismaClient.dailyStoreSales.deleteMany();
  await prismaClient.weeklyStoreSales.deleteMany();
  await prismaClient.monthlyStoreSales.deleteMany();
  await prismaClient.yearlyStoreSales.deleteMany();

  await prismaClient.favoriteStore.deleteMany();
  await prismaClient.stock.deleteMany();

  await prismaClient.cart.deleteMany();
  await prismaClient.product.deleteMany();
  await prismaClient.category.deleteMany();
  await prismaClient.store.deleteMany();
  await prismaClient.size.deleteMany();
  await prismaClient.user.deleteMany();
  await prismaClient.grade.deleteMany();
}
