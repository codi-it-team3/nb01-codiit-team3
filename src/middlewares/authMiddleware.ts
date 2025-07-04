import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../lib/token';
import UnauthorizedError from '../lib/errors/UnauthorizedError';

export default function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) throw new UnauthorizedError('인증이 필요합니다.');

  const payload = verifyAccessToken(token);
  req.user = { id: payload.id };
  next();
}

export {};
