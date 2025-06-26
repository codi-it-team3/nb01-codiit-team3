import request from 'supertest';
import app from '../../src/app';
import { prismaClient } from '../../src/lib/prismaClient';
import { GradeName } from '@prisma/client';

describe('Auth API 통합 테스트', () => {
  const userCredentials = {
    email: 'buyer@codiit.com',
    password: 'test1234',
  };

  const userInfo = {
    name: '김유저',
    email: `user_${Date.now()}@example.com`,
    password: 'password123',
    type: 'BUYER',
    image: null,
  };

  let accessToken: string;
  let refreshToken: string;
  let userId: string;

  beforeAll(async () => {
    await prismaClient.grade.upsert({
      where: { id: 'grade_green' },
      update: {},
      create: {
        id: 'grade_green',
        name: GradeName.Green,
        rate: 0,
        minAmount: 0,
      },
    });
    const user = await prismaClient.user.findUnique({
      where: { email: userCredentials.email },
    });

    if (!user) {
      const { hashPassword } = await import('../../src/lib/hash');
      await prismaClient.user.create({
        data: {
          email: userCredentials.email,
          name: 'TestUser',
          password: await hashPassword(userCredentials.password),
          type: 'BUYER',
        },
      });
    }
  });
    afterAll(async () => { 
    await prismaClient.user.deleteMany({
      where: {
        email: userInfo.email,
      },
    }); 
    await prismaClient.user.deleteMany({
      where: {
        email: 'buyer@codiit.com', 
      },
    });
  });

  test('POST /api/users | 회원가입 성공', async () => {
    const res = await request(app).post('/api/users').send(userInfo);

    expect(res.status).toBe(201);
    expect(res.body.email).toBe(userInfo.email);
    expect(res.body.name).toBe(userInfo.name);

    userId = res.body.id;
    userCredentials.email = userInfo.email;
    userCredentials.password = userInfo.password;
  });

  test('POST /api/auth/login | 로그인 성공', async () => {
  const res = await request(app).post('/api/auth/login').send({
    email: userInfo.email,
    password: userInfo.password,
  });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe(userInfo.email);

    accessToken = res.body.accessToken;

    const setCookie = res.headers['set-cookie'];

    if (Array.isArray(setCookie)) {
      const refreshCookie = setCookie.find((cookie: string) => cookie.startsWith('refresh-token='));
      refreshToken = refreshCookie?.split(';')[0]?.split('=')[1];
    } else if (typeof setCookie === 'string') {
      if (setCookie.startsWith('refresh-token=')) {
        refreshToken = setCookie.split(';')[0]?.split('=')[1];
      }
    }

    expect(refreshToken).toBeDefined();
  });
  test('POST /api/auth/login | 비밀번호 틀림', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ ...userCredentials, password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('이메일 또는 비밀번호가 올바르지 않습니다.');
  });

  test('POST /api/auth/refresh | Refresh Token으로 Access Token 재발급', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', [`refresh-token=${refreshToken}`]);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
  });

  test('POST /api/auth/refresh | 잘못된 Refresh Token', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', [`refresh-token=invalidtoken`]);

    expect(res.status).toBe(401);
  });

  test('POST /api/auth/logout | 로그아웃 성공', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('성공적으로 로그아웃되었습니다.');
  });

  test('POST /api/auth/logout | 인증 없이 로그아웃 요청', async () => {
    const res = await request(app).post('/api/auth/logout');

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('인증이 필요합니다.');
  });
  describe('User API 통합 테스트', () => {
    test('GET /api/users/me | 내 정보 조회 성공', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body.email).toBe(userCredentials.email);
      expect(res.body).toHaveProperty('grade');
    });

    
    test('PATCH /api/users/me | 이름, 비밀번호 수정 성공', async () => {
      const res = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .field('name', '김수정')
        .field('currentPassword', userCredentials.password)
        .field('password', 'newpassword123');
      userCredentials.password = 'newpassword123';

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('김수정');
    });

    test('PATCH /api/users/me | 유저가 없을 경우', async () => {
      const res = await request(app).patch('/api/users/me').field('name', '김삭제');

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('인증이 필요합니다.');
    });

    test('PATCH /api/users/me | 현재 비밀번호 틀림', async () => {
      const res = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .field('name', '김실패')
        .field('currentPassword', 'wrong-password')
        .field('password', 'newpass123');

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('현재 비밀번호가 일치하지 않습니다.');
    });
  });

 
  describe('관심 스토어 및 탈퇴 테스트', () => {
    test.skip('GET /api/users/me/likes | 관심 스토어 조회 성공', async () => {
      const res = await request(app)
        .get('/api/users/me/likes')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      if (res.body.length > 0) {
        expect(res.body[0]).toHaveProperty('storeId');
        expect(res.body[0]).toHaveProperty('store');
        expect(res.body[0].store).toHaveProperty('name');
      }
    });

    test.skip('GET /api/users/me/likes | 토큰 없이 요청', async () => {
      const res = await request(app).get('/api/users/me/likes');

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('인증이 필요합니다.');
    });

    test('DELETE /api/users/delete | 회원 탈퇴 성공', async () => {
      const res = await request(app)
        .delete('/api/users/delete')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Content-Type', 'application/json')
        .send({ currentPassword: userCredentials.password });

      expect(res.status).toBe(200);
    });

    test('DELETE /api/users/delete | 인증 없이 탈퇴 요청', async () => {
      const res = await request(app).delete('/api/users/delete');

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('인증이 필요합니다.');
    });

    test('DELETE /api/users/delete | 이미 삭제된 유저로 요청', async () => {
      const res = await request(app)
        .delete('/api/users/delete')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ currentPassword: 'newpassword123' });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('유저를 찾을 수 없습니다.');
    });
  }); 
 
});