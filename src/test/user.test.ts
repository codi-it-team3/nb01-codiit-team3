import request from 'supertest';
import app from '../app';
import { prismaClient } from '../lib/prismaClient';
import jwt from 'jsonwebtoken';

const userData = {
  name: '김유저',
  email: 'user01@example.com',
  password: 'password123',
  type: 'BUYER',
  image: null,
};

beforeAll(async () => {
  await prismaClient.grade.upsert({
    where: { id: 'grade_green' },
    update: {},
    create: {
      id: 'grade_green',
      name: 'Green',
      rate: 0,
      minAmount: 0,
    },
  });
});

afterAll(async () => {
  await prismaClient.user.deleteMany();
  await prismaClient.grade.deleteMany();
  await prismaClient.$disconnect();
});

describe('User 서비스', () => {
  describe('POST /api/users/', () => {
    const endpoint = '/api/users/';

    beforeEach(async () => {
      await prismaClient.user.deleteMany();
    });

    test('201 | 회원 가입 성공한 유저의 값을 반환', async () => {
      const res = await request(app).post(endpoint).send(userData);

      expect(res.status).toBe(201);
      expect(res.body).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          name: userData.name,
          email: userData.email,
          type: userData.type,
          points: expect.any(Number),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          image: expect.any(String),
          grade: expect.objectContaining({
            id: 'grade_green',
            name: expect.any(String),
            rate: expect.any(Number),
            minAmount: expect.any(Number),
          }),
        }),
      );
    });

    test('409 | 이미 존재하는 유저일 경우', async () => {
      await request(app).post(endpoint).send(userData);
      const res = await request(app).post(endpoint).send(userData);

      expect(res.status).toBe(409);
      expect(res.body).toEqual({
        message: '이미 존재하는 유저입니다.',
        statusCode: 409,
        error: 'Conflict',
      });
    });
  });

  describe('GET /api/users/me', () => {
    const meEndpoint = '/api/users/me';

    test('200 | 로그인한 유저 정보 반환', async () => {
      await prismaClient.user.deleteMany();
      await request(app).post('/api/user/').send(userData);
      const loginRes = await request(app).post('/api/auth/login').send({
        email: userData.email,
        password: userData.password,
      });
      const accessToken = loginRes.body.accessToken;

      const res = await request(app).get(meEndpoint).set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          name: userData.name,
          email: userData.email,
          type: userData.type,
          points: expect.any(Number),
          grade: expect.objectContaining({
            id: 'grade_green',
            name: expect.any(String),
            rate: expect.any(Number),
            minAmount: expect.any(Number),
          }),
          image: expect.any(String),
        }),
      );
    });

    test('401 | 토큰 없이 요청 시 에러', async () => {
      const res = await request(app).get(meEndpoint);
      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /api/users/me', () => {
    const updateEndpoint = '/api/users/me';

    test('200 | 이름, 비밀번호 수정 성공', async () => {
      await prismaClient.user.deleteMany();
      await request(app).post('/api/user/').send(userData);
      const loginRes = await request(app).post('/api/auth/login').send({
        email: userData.email,
        password: userData.password,
      });
      const accessToken = loginRes.body.accessToken;

      const res = await request(app)
        .patch(updateEndpoint)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: '김유저수정',
          currentPassword: userData.password,
          password: 'newPassword123',
        });

      expect(res.status).toBe(200);
      expect(res.body).toEqual(
        expect.objectContaining({
          name: '김유저수정',
          email: userData.email,
          type: userData.type,
          image: expect.any(String),
          grade: expect.any(Object),
        }),
      );
    });

    test('404 | 유저가 없을 경우', async () => {
      await prismaClient.user.deleteMany();
      const dummyToken = jwt.sign({ id: 'non-existent-id' }, process.env.JWT_ACCESS_TOKEN_SECRET!, {
        expiresIn: '1h',
      });

      const res = await request(app)
        .patch(updateEndpoint)
        .set('Authorization', `Bearer ${dummyToken}`)
        .field('name', '김삭제')
        .field('currentPassword', 'password123');

      expect(res.status).toBe(404);
      expect(res.body).toEqual({
        message: '유저를 찾을 수 없습니다.',
        statusCode: 404,
        error: 'Not Found',
      });
    });

    test('401 | 토큰 없이 수정 시도', async () => {
      const res = await request(app).patch(updateEndpoint).field('name', '김무단');

      expect(res.status).toBe(401);
    });

    test('400 | 현재 비밀번호 틀림', async () => {
      await prismaClient.user.deleteMany();
      await request(app).post('/api/user/').send(userData);
      const loginRes = await request(app).post('/api/auth/login').send({
        email: userData.email,
        password: userData.password,
      });
      const accessToken = loginRes.body.accessToken;

      const res = await request(app)
        .patch(updateEndpoint)
        .set('Authorization', `Bearer ${accessToken}`)
        .field('currentPassword', 'wrongPassword')
        .field('password', 'anotherNewPass123');

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/users/me/likes', () => {
    const endpoint = '/api/users/me/likes';

    test('200 | 관심 스토어 조회 성공', async () => {
      const user = await prismaClient.user.create({
        data: {
          id: 'user01',
          name: '관심유저',
          email: 'like@example.com',
          password: 'hashed',
          type: 'BUYER',
          gradeId: 'grade_green',
        },
      });

      const store = await prismaClient.store.create({
        data: {
          id: 'store01',
          name: '테스트 스토어',
          address: '서울시 강남구',
          phoneNumber: '010-1234-5678',
          content: '스토어 설명',
          image: 'https://example.com/image.jpg',
          userId: user.id,
        },
      });

      await prismaClient.favoriteStore.create({
        data: {
          userId: user.id,
          storeId: store.id,
        },
      });

      const accessToken = jwt.sign({ id: user.id }, process.env.JWT_ACCESS_TOKEN_SECRET!, {
        expiresIn: '1h',
      });

      const res = await request(app).get(endpoint).set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            storeId: store.id,
            userId: user.id,
            store: expect.objectContaining({
              id: store.id,
              name: store.name,
              address: store.address,
              phoneNumber: store.phoneNumber,
              content: store.content,
              image: store.image,
            }),
          }),
        ]),
      );
    });

    test('404 | 유저가 존재하지 않는 경우', async () => {
      const dummyToken = jwt.sign({ id: 'non-existent-id' }, process.env.JWT_ACCESS_TOKEN_SECRET!, {
        expiresIn: '1h',
      });

      const res = await request(app).get(endpoint).set('Authorization', `Bearer ${dummyToken}`);

      expect(res.status).toBe(404);
      expect(res.body).toEqual({
        message: '유저를 찾을 수 없습니다.',
        statusCode: 404,
        error: 'Not Found',
      });
    });

    test('401 | 인증 없이 요청', async () => {
      const res = await request(app).get(endpoint);
      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/users/me', () => {
    const endpoint = '/api/users/me';

    test('200 | 회원 탈퇴 성공', async () => {
      await prismaClient.user.deleteMany();
      await request(app).post('/api/user/').send(userData);
      const loginRes = await request(app).post('/api/auth/login').send({
        email: userData.email,
        password: userData.password,
      });
      const accessToken = loginRes.body.accessToken;

      const res = await request(app)
        .delete(endpoint)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ currentPassword: userData.password });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: '회원 탈퇴 성공' });
    });

    test('401 | 인증 없이 요청 시 에러', async () => {
      const res = await request(app).delete(endpoint);
      expect(res.status).toBe(401);
    });

    test('404 | 유저가 없는 경우', async () => {
      const dummyToken = jwt.sign({ id: 'non-existent-id' }, process.env.JWT_ACCESS_TOKEN_SECRET!, {
        expiresIn: '1h',
      });

      const res = await request(app)
        .delete(endpoint)
        .set('Authorization', `Bearer ${dummyToken}`)
        .send({ currentPassword: 'irrelevant' });

      expect(res.status).toBe(404);
      expect(res.body).toEqual({
        message: '유저를 찾을 수 없습니다.',
        statusCode: 404,
        error: 'Not Found',
      });
    });
  });
});
