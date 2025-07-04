import request from 'supertest';
import app from '../app';
import { prismaClient } from '../lib/prismaClient';
import { clearDatabase } from '../lib/testUtils';
import { GradeName, UserType } from '@prisma/client';

describe('리뷰 API 테스트', () => {
  beforeEach(async () => {
    await clearDatabase(prismaClient);
  });

  afterAll(async () => {
    await prismaClient.$disconnect();
  });

  describe('POST /api/product/{productId}/reviews', () => {
    beforeEach(async () => {
      const grade = await prismaClient.grade.create({
        data: {
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
          image: 'image File',
          type: UserType.SELLER,
          gradeId: grade.id,
        },
      });

      const store = await prismaClient.store.create({
        data: {
          name: 'CODI-IT',
          address: '서울특별시 강남구 테헤란로 123',
          phoneNumber: '010-1234-5678',
          content: '저희는 CODI-IT 입니다.',
          image: 'https://example.com/image.jpg',
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
          image: 'https://s3-URL',
          content: '가디건임',
          storeId: store.id,
          price: 20000,
          discountRate: 10,
          categoryId: category.id,
        },
      });

      const size = await prismaClient.size.create({
        data: {
          size: { ko: 'L', en: 'Large' },
          name: 'L',
        },
      });

      const stock = await prismaClient.stock.create({
        data: {
          productId: product.id,
          sizeId: size.id,
          quantity: 10,
        },
      });
    });

    test('인증되지 않은 사용자가 리뷰를 작성할 때 401을 반환해야 한다', async () => {
      const response = await request(app).post('/api/product/{productId}/reviews');
      expect(response.status).toBe(401);
    });

    test('인증된 사용자가 리뷰를 생성할 때 201을 반환해야 한다', async () => {
      const agent = request.agent(app);

      const grade = await prismaClient.grade.findFirstOrThrow({
        where: { name: GradeName.Green },
      });

      const userResponse = await agent.post('/api/users').send({
        name: '이유저',
        email: 'user02@example.com',
        password: 'password456',
        image: 'image File',
        type: UserType.BUYER,
        gradeId: grade.id,
      });

      await agent.post('/api/auth/login').send({
        email: 'user02@example.com',
        password: 'password456',
      });

      const order = await prismaClient.order.create({
        data: {
          name: '이유저',
          phoneNumber: '010-1234-5678',
          address: '서울특별시 강남구 테헤란로 123',
          subtotal: 0,
          userId: userResponse.body.id,
        },
      });

      const product = await prismaClient.product.findFirstOrThrow({
        where: { name: '가디건' },
      });

      const size = await prismaClient.size.findFirstOrThrow({
        where: { name: 'L' },
      });

      const orderItem = await prismaClient.orderItem.create({
        data: {
          orderId: order.id,
          productId: product.id,
          sizeId: size.id,
          price: 1000,
        },
      });

      const reviewPayload = {
        content: '좋은 제품이에요!',
        rating: 5,
        orderItemId: orderItem.id,
        userId: userResponse.body.id,
        productId: product.id,
      };

      const response = await agent.post('/api/product/{productId}/reviews').send(reviewPayload);
      expect(response.status).toBe(201);
    });
  });

  describe('GET /api/review/{reviewId}', () => {});
});
