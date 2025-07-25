import bcrypt from 'bcrypt';
import * as usersRepository from '../repositories/usersRepository';
import User from '../types/User';
import BadRequestError from '../lib/errors/BadRequestError';
import { generateToken, verifyAccessToken, verifyRefreshToken } from '../lib/token';
import NotFoundError from '../lib/errors/NotFoundError';
import UnauthorizedError from '../lib/errors/UnauthorizedError';
import { hashPassword as hashPasswordUtil, verifyPassword } from '../lib/hash';

export async function login(data: Pick<User, 'email' | 'password'>) {
  const user = await usersRepository.findbyEmail(data.email);
  if (!user) {
    throw new NotFoundError('User', data.email);
  }

  const isPasswordCorrect = await verifyPassword(data.password, user.password);
  if (!isPasswordCorrect) {
    throw new UnauthorizedError('이메일 또는 비밀번호가 올바르지 않습니다.');
  }

  const { accessToken, refreshToken } = generateToken(user.id, user.type);
  await usersRepository.updateUser(user.id, { refreshToken });

  return {
    accessToken,
    refreshToken,
    user,
  };
}

export async function refreshToken(
  refreshToken?: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  if (!refreshToken) {
    throw new BadRequestError('Invalid refresh token');
  }

  let userId: string;
  try {
    ({ userId } = verifyRefreshToken(refreshToken));
  } catch (err) {
    throw new UnauthorizedError('Invalid refresh token');
  }

  const user = await usersRepository.getUser(userId);
  if (!user) {
    throw new UnauthorizedError('User not found');
  }

  if (user.refreshToken !== refreshToken) {
    throw new UnauthorizedError('Refresh token mismatch');
  }

  const { accessToken, refreshToken: newRefreshToken } = generateToken(user.id, user.type);

  await usersRepository.updateUser(user.id, { refreshToken: newRefreshToken });

  return { accessToken, refreshToken: newRefreshToken };
}

export async function updateMyPassword(userId: string, password: string, newPassword: string) {
  const user = await usersRepository.getUser(userId);
  if (!user) {
    throw new NotFoundError('user', userId);
  }

  const isPasswordValid = await verifyPassword(user.password, password);
  if (!isPasswordValid) {
    throw new BadRequestError('Invalid credentials');
  }

  const hashedPassword = await hashPasswordUtil(newPassword);
  await usersRepository.updateUser(userId, { password: hashedPassword });
}

export async function authenticate(accessToken?: string) {
  if (!accessToken) {
    throw new UnauthorizedError('Unauthorized');
  }

  const { id } = verifyAccessToken(accessToken);
  const user = await usersRepository.getUser(id);
  if (!user) {
    throw new UnauthorizedError('Unauthorized');
  }
  return user;
}

export async function logout(userId: string) {
  if (!userId) {
    throw new UnauthorizedError('로그인된 사용자가 아닙니다.');
  }

  await usersRepository.updateUser(userId, { refreshToken: null });

  return { message: '성공적으로 로그아웃되었습니다.' };
}
