import request from 'supertest';
import app from '../app';
import { GradeName, UserType } from '@prisma/client';
import { prismaClient } from '../lib/prismaClient';
import { clearDatabase } from '../lib/testUtils';

describe('문의 API 테스트', () => {
  beforeEach(async () => {
    await clearDatabase(prismaClient);
  });

  afterAll(async () => {
    await prismaClient.$disconnect();
  });

  describe('GET /api/inquiries', () => {
    beforeEach(async () => {
      const grade = await prismaClient.grade.create({
        data: {
          id: 'grade_green',
          name: GradeName.Green,
          rate: 5,
          minAmount: 1000000,
        },
      });

      const seller = await prismaClient.user.create({
        data: {
          name: '김유저',
          email: 'user01@example.com',
          password: 'password123',
          type: UserType.SELLER,
          image: 'image file',
        },
      });

      const store = await prismaClient.store.create({
        data: {
          name: 'CODI-IT',
          address: '서울특별시 강남구 테헤란로 123',
          content: '저희는 CODI-IT 입니다.',
          phoneNumber: '010-1234-5678',
          userId: seller.id,
        },
      });

      const category = await prismaClient.category.create({
        data: {
          name: 'TOP',
        },
      });

      const product = await prismaClient.product.create({
        data: {
          name: '가디건',
          storeId: store.id,
          categoryId: category.id,
        },
      });
    });

    test('인증되지 않은 사용자가 내 문의를 조회할 때 401을 반환해야 한다', async () => {
      const response = await request(app).get('/api/inquiries');
      expect(response.status).toBe(401);
    });

    test('인증된 사용자가 내 문의를 조회할 때 200을 반환해야 한다', async () => {
      const agent = request.agent(app);

      const user = await agent.post('/api/users').send({
        name: '이유저',
        email: 'user02@example.com',
        password: 'password456',
        type: UserType.BUYER,
        image: 'image file',
      });

      const userResponse = await agent.post('/api/auth/login').send({
        email: 'user02@example.com',
        password: 'password456',
      });

      const token = userResponse.body.accessToken;

      const product = await prismaClient.product.findFirst({
        where: { name: '가디건' },
      });

      const inquiry = await prismaClient.inquiry.create({
        data: {
          userId: user.body.id,
          productId: product?.id!,
          title: ' 상품 문의합니다.',
          content: '문의 내용입니다.',
          isSecret: false,
        },
      });

      const response = await agent.get('/api/inquiries').set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(200);
    });
  });
});
