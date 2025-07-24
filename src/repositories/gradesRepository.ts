import { prismaClient } from '../lib/prismaClient';

export async function getGradeList() {
  const grades = await prismaClient.grade.findMany();
  return grades;
}
