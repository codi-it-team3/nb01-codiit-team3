import { Request, Response } from 'express';
import { create } from 'superstruct';
import { ACCESS_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_NAME, NODE_ENV } from '../lib/constants';
import { LoginBodyStruct, RegisterBodyStruct } from '../structs/authStruct';
import * as authService from '../services/authServices';
import * as userService from '../services/userService';
import userResponseDTO from '../dto/userResponseDTO';
import { User, UserType } from '@prisma/client';
import asyncHandler from '../lib/asyncHandler';
import UnauthorizedError from '../lib/errors/UnauthorizedError';
import { UpdateMyInfoBodyStruct, DeleteMyAccountBodyStruct } from '../structs/usersStructs';

export async function register(req: Request, res: Response) {
  console.log('🔥🔥🔥 register controller 진입');
  const data = create(req.body, RegisterBodyStruct);
  console.log('✅ validated data:', data);
  const user = await userService.register({
    ...data,
    type: UserType[data.type as keyof typeof UserType],
  });
  console.log('🧑‍💻 생성된 user:', user);
  res.status(201).json(userResponseDTO(user));
}

export const getMyInfo = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError('로그인 필요');
  const user = await userService.getMyInfo(req.user.id);
  res.json(user);
});

export const updateMyInfo = asyncHandler(async (req: Request, res: Response) => {
  console.log('🧠 req.user:', req.user);
  if (!req.user) throw new UnauthorizedError('로그인 필요');

  const body = create(req.body, UpdateMyInfoBodyStruct);
  const updatedUser = await userService.updateMyInfo(req.user.id, body);

  res.json(userResponseDTO(updatedUser));
});

export const deleteMyAccount = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError('로그인 필요');

  const { currentPassword } = create(req.body, DeleteMyAccountBodyStruct);
  await userService.deleteMyAccount(req.user.id, currentPassword);

  res.status(200).json({ message: '회원 탈퇴 성공' });
});
