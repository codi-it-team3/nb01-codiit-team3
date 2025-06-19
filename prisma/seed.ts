import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.grade.upsert({
    where: { id: 'grade_green' },
    update: {},
    create: {
      id: 'grade_green',
      name: '그린등급',
      rate: 0,
      minAmount: 0,
    },
  });
}

main()
  .then(() => {
    console.log('✅ Grade seed complete');
    return prisma.$disconnect();
  })
  .catch((e) => {
    console.error(e);
    return prisma.$disconnect();
  });