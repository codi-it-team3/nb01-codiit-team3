import * as usersRepository from '../repositories/usersRepository';
import * as authService from '../services/authServices';
import NotFoundError from '../lib/errors/NotFoundError';
import UnauthorizedError from '../lib/errors/UnauthorizedError';
import { UserType } from '@prisma/client';
import * as tokenUtil from '../lib/token';
import * as hashUtil from '../../src/lib/hash';
import request from 'supertest';
import app from '../../src/app';

jest.mock('../repositories/usersRepository');

describe('Auth 서비스', () => {
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    name: 'Tester',
    password: 'hashedPassword',
    type: 'Buyer' as UserType,
    image: null,
    points: 1000,
    refreshToken: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    gradeId: 'grade-123',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    test('로그인 성공 시 토큰과 사용자 정보를 반환한다', async () => {
      jest.mocked(usersRepository.findbyEmail).mockResolvedValue(mockUser);
      jest.spyOn(hashUtil, 'verifyPassword').mockResolvedValue(true);
      jest.spyOn(tokenUtil, 'generateToken').mockReturnValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      const result = await authService.login({
        email: mockUser.email,
        password: 'test1234',
      });

      expect(usersRepository.findbyEmail).toHaveBeenCalledWith(mockUser.email);
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    test('이메일이 존재하지 않으면 NotFoundError를 던진다', async () => {
      jest.mocked(usersRepository.findbyEmail).mockResolvedValue(null);

      await expect(
        authService.login({ email: 'wrong@example.com', password: 'wrongpass' }),
      ).rejects.toThrow(NotFoundError);
    });

    test('비밀번호가 틀리면 UnauthorizedError를 던진다', async () => {
      jest.mocked(usersRepository.findbyEmail).mockResolvedValue(mockUser);
      jest.spyOn(hashUtil, 'verifyPassword').mockResolvedValue(false); 

      await expect(
        authService.login({ email: mockUser.email, password: 'wrongpass' }),
      ).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('refreshToken', () => {
    test('리프레시 토큰이 유효하면 새로운 accessToken을 반환한다', async () => {
      const userId = '1';

      jest.spyOn(tokenUtil, 'verifyRefreshToken').mockReturnValue({ userId });
      jest.spyOn(usersRepository, 'getUser').mockResolvedValue(mockUser as any);
      jest.spyOn(tokenUtil, 'generateToken').mockReturnValue({
        accessToken: 'new-access-token',
        refreshToken: 'dummy-refresh',
      });

      const result = await authService.refreshToken('valid-refresh-token');

      expect(result.accessToken).toBe('new-access-token');
    });

    test('리프레시 토큰이 유효하지 않으면 UnauthorizedError를 던진다', async () => {
      jest.spyOn(tokenUtil, 'verifyRefreshToken').mockImplementation(() => {
        throw new UnauthorizedError('토큰이 유효하지 않습니다');
      });

      await expect(authService.refreshToken('invalid-token')).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('logout', () => {
    test('로그아웃 시 refreshToken이 null로 업데이트된다', async () => {
      jest.spyOn(usersRepository, 'updateUser').mockResolvedValue({
        ...mockUser,
        refreshToken: null,
      });

      const result = await authService.logout(mockUser.id);

      expect(usersRepository.updateUser).toHaveBeenCalledWith(mockUser.id, { refreshToken: null });
      expect(result.message).toBe('성공적으로 로그아웃되었습니다.');
    });

    test('userId 없이 로그아웃 시 UnauthorizedError를 던진다', async () => {
      await expect(authService.logout(undefined as any)).rejects.toThrow(UnauthorizedError);
    });
  });
});
