import { Request, Response } from 'express';
import * as imagesService from '../services/s3Service';

export const upload = imagesService.upload;

export async function uploadImage(req: Request, res: Response) {
  const url = await imagesService.uploadImage(req.file);
  res.send({ url });
}
