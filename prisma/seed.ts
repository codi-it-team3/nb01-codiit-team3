import { GradeName, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const gradeSeedData = [
  { id: 'grade_vip', name: GradeName.VIP, rate: 10, minAmount: 1000000 },
  { id: 'grade_black', name: GradeName.Black, rate: 7, minAmount: 500000 },
  { id: 'grade_red', name: GradeName.Red, rate: 5, minAmount: 300000 },
  { id: 'grade_orange', name: GradeName.Orange, rate: 3, minAmount: 100000 },
  { id: 'grade_green', name: GradeName.Green, rate: 1, minAmount: 0 },
];

const sizeSeedData = [
  {
    id: 'size_free',
    name: 'FREE',
    size: { KR: 'FREE', US: 'OneSize' },
  },
  {
    id: 'size_xs',
    name: 'XS',
    size: { KR: '85', US: 'S' },
  },
  {
    id: 'size_s',
    name: 'S',
    size: { KR: '90', US: 'S' },
  },
  {
    id: 'size_m',
    name: 'M',
    size: { KR: '95', US: 'M' },
  },
  {
    id: 'size_l',
    name: 'L',
    size: { KR: '100', US: 'L' },
  },
  {
    id: 'size_xl',
    name: 'XL',
    size: { KR: '105', US: 'XL' },
  },
];

async function main() {
  for (const grade of gradeSeedData) {
    await prisma.grade.upsert({
      where: { id: grade.id },
      update: {},
      create: grade,
    });
  }
  for (const size of sizeSeedData) {
    await prisma.size.upsert({
      where: { id: size.id },
      update: {},
      create: size,
    });
  }
}

main()
  .then(() => {
    console.log('Grade seed complete');
    return prisma.$disconnect();
  })
  .catch((e) => {
    console.error(e);
    return prisma.$disconnect();
  });
