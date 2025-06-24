import { Request, Response } from 'express';
import { create } from 'superstruct';
import { ACCESS_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_NAME, NODE_ENV } from '../lib/constants';
import { LoginBodyStruct, RegisterBodyStruct } from '../structs/authStruct';
import * as authService from '../services/authServices';
import userResponseDTO from '../dto/userResponseDTO';
import { UserType } from '@prisma/client';

export async function login(req: Request, res: Response) {
  const data = create(req.body, LoginBodyStruct);
  const { accessToken, refreshToken, user } = await authService.login(data);
  setTokenCookies(res, accessToken, refreshToken);
  res.status(201).json({
    user: userResponseDTO(user),
    accessToken,
  });
}

export async function logout(req: Request, res: Response) {
  clearTokenCookies(res);

  const userId = req.user?.id;
  if (userId) {
    await authService.logout(userId);
  }
  res.status(200).json({ message: '성공적으로 로그아웃되었습니다.' });
}

export async function refreshToken(req: Request, res: Response) {
  const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE_NAME];
  const { accessToken, refreshToken: newRefreshToken } =
    await authService.refreshToken(refreshToken);
  setTokenCookies(res, accessToken, newRefreshToken);
  res.status(200).json({ accessToken });
}

function setTokenCookies(res: Response, accessToken: string, refreshToken: string) {
  res.cookie(ACCESS_TOKEN_COOKIE_NAME, accessToken, {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    maxAge: 1 * 60 * 60 * 1000,
  });
  res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    maxAge: 3 * 24 * 60 * 60 * 1000,
    path: '/api/auth/refresh',
  });
}

function clearTokenCookies(res: Response) {
  res.clearCookie(ACCESS_TOKEN_COOKIE_NAME);
  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME);
}

export function refresh(
  refresh: any,
): import('express-serve-static-core').RequestHandler<
  import('express-serve-static-core').ParamsDictionary,
  any,
  any,
  import('qs').ParsedQs,
  Record<string, any>
> {
  throw new Error('Function not implemented.');
}
