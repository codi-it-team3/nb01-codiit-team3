import jwt from 'jsonwebtoken';
import { JWT_ACCESS_TOKEN_SECRET, JWT_REFRESH_TOKEN_SECRET } from './constants';
import UnauthorizedError from './errors/UnauthorizedError';

export function generateToken(userId: string) {
  const accessToken = jwt.sign({ id: userId }, JWT_ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
  const refreshToken = jwt.sign({ id: userId }, JWT_REFRESH_TOKEN_SECRET, { expiresIn: '3d' });
  return { accessToken, refreshToken };
}

export function verifyAccessToken(token: string) {
  const decodeing = jwt.verify(token, JWT_ACCESS_TOKEN_SECRET);
  if (typeof decodeing === 'string') {
    throw new Error('Invalid token');
  }
  return { id: decodeing.id };
}

export function verifyRefreshToken(token: string) {
  try {
    const decoding = jwt.verify(token, JWT_REFRESH_TOKEN_SECRET);

    if (typeof decoding === 'string') {
      throw new UnauthorizedError('유효하지 않은 토큰입니다.');
    }

    return { userId: decoding.id };
  } catch (e) {
    console.error('Refresh token verify 실패:', e);
    throw new UnauthorizedError('유효하지 않은 토큰입니다.');
  }
}
