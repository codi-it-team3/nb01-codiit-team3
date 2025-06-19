import bcrypt from 'bcrypt'
import *as usersRepository from '../repositories/usersRepository' 
import User from '../types/User';  
import BadRequestError from '../lib/errors/BadRequestError';
import { generateToken, verifyAccessToken, verfiyRefreshToken } from '../lib/token';
import NotFoundError from '../lib/errors/NotFoundError';
import UnauthorizedError from '../lib/errors/UnauthorizedError';
import { RegisterUserInput } from '../types/User';  
import { UserType } from '@prisma/client';
import { hashPassword, verifyPassword } from '../lib/hash';

export async function login(data:Pick<User, 'email' | 'password'>) {
  const user = await usersRepository.findbyEmail(data.email);
  if(!user){
    throw new BadRequestError('이메일을 확인해주세요요');
  } 
  const verifyPasswords = await verifyPassword(data.password, user.password);
  if(!verifyPasswords){
    throw new BadRequestError('비밀번호를 확인해주세요요');
  }
  const {accessToken, refreshToken} = generateToken(user.id);
  await usersRepository.updateUser(user.id, { refreshToken });
  return {
    accessToken,refreshToken
  }
}

export async function refreshToken(refreshToken?: string): Promise<{ accessToken: string; refreshToken: string }> {
  if (!refreshToken) {
    throw new BadRequestError('Invalid refresh token');
  }

  const { userId } = verfiyRefreshToken(refreshToken);
  const user = await usersRepository.getUser(userId);

  if (!user) {
    throw new UnauthorizedError('User not found');
  }

  const { accessToken, refreshToken: newRefreshToken } = generateToken(user.id);

  return { accessToken, refreshToken: newRefreshToken };
}

export async function updateMyPassword(userId: string, password: string, newPassword: string) {
  const user = await usersRepository.getUser(userId);
  if (!user) {
    throw new NotFoundError('user', userId);
  }

  const isPasswordValid = await verifyPassword(password, user.password); 
  if (!isPasswordValid) {
    throw new BadRequestError('Invalid credentials');
  }

  const hashedPassword = await hashPassword(newPassword);
  await usersRepository.updateUser(userId, { password: hashedPassword });
} 

export async function authenticate(accessToken?: string) {
  if (!accessToken) {
    throw new UnauthorizedError('Unauthorized');
  }

  const { userId } = verifyAccessToken(accessToken);
  const user = await usersRepository.getUser(userId);
  if (!user) {
    throw new UnauthorizedError('Unauthorized');
  }
  return user;
}
