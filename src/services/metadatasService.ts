import * as sizesRepository from '../repositories/sizesRepository';
import * as categoriesRepository from '../repositories/categoriesRepository';
import * as gradesRepository from '../repositories/gradesRepository';
import { CategoryName } from '@prisma/client';

export async function getSizeList() {
  const sizes = await sizesRepository.getSizeList();
  return sizes;
}

export async function getCategory(name: CategoryName) {
  const category = await categoriesRepository.getCategoryByName(name);
  return category;
}

export async function getGradeList() {
  const grades = await gradesRepository.getGradeList();
  return grades;
}
