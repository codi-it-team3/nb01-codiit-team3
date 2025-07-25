import { Request, Response } from 'express';
import { create } from 'superstruct';
import { ACCESS_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_NAME, NODE_ENV } from '../lib/constants';
import { LoginBodyStruct } from '../structs/authStruct';
import * as authService from '../services/authServices';
import userResponseDTO from '../dto/userResponseDTO'; 



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
  console.log('🚀 controller 진입');
  const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE_NAME];
   console.log('📦 받은 refreshToken:', refreshToken);
  const { accessToken, refreshToken: newRefreshToken } =
    await authService.refreshToken(refreshToken);
    console.log('✅ 재발급 완료:', accessToken);
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
    path: '/',
  });
}

function clearTokenCookies(res: Response) {
  res.clearCookie(ACCESS_TOKEN_COOKIE_NAME);
  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME);
}
 