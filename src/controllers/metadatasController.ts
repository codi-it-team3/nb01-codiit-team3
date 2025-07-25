import { Request, Response } from 'express';
import * as metadatasService from '../services/metadatasService';
import { GetCategoryParamsStruct } from '../structs/metadatasStruct';
import { create } from 'superstruct';

export async function getSizeList(req: Request, res: Response) {
  const sizes = await metadatasService.getSizeList();
  res.send(sizes);
}

export async function getCategory(req: Request, res: Response) {
  const { name } = create(req.params, GetCategoryParamsStruct);
  const category = await metadatasService.getCategory(name);
  res.send(category);
}

export async function getGradeList(req: Request, res: Response) {
  const grades = await metadatasService.getGradeList();
  res.send(grades);
}
