import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

import request from 'supertest';
import app from '../app';
import { GradeName, UserType } from '@prisma/client';
import { prismaClient } from '../lib/prismaClient';
import { clearDatabase } from '../lib/testUtils';
import { generateToken } from '../lib/token';

describe('Store API', () => {
  let userId: string;
  let storeId: string;
  let accessToken: string;
  let buyerToken: string;

  beforeAll(async () => {
    await clearDatabase(prismaClient);

    await prismaClient.grade.createMany({
      data: [
        {
          id: 'grade-basic',
          name: GradeName.Green,
          rate: 1.0,
          minAmount: 0,
        },
        {
          id: 'grade-vip',
          name: GradeName.VIP,
          rate: 1.2,
          minAmount: 500000,
        },
      ],
    });

    const seller = await prismaClient.user.create({
      data: {
        id: 'user-1',
        email: 'storetest@example.com',
        name: '스토어테스트유저',
        password: 'hashed-password',
        type: UserType.SELLER,
        gradeId: 'grade-basic',
      },
    });

    const buyer = await prismaClient.user.create({
      data: {
        id: 'user-2',
        email: 'buyertest@example.com',
        name: '스토어구매자',
        password: 'hashed-password',
        type: UserType.BUYER,
        gradeId: 'grade-basic',
      },
    });

    userId = seller.id;
    accessToken = generateToken(seller.id, UserType.SELLER).accessToken;
    buyerToken = generateToken(buyer.id, UserType.BUYER).accessToken;
  });

  afterAll(async () => {
    await clearDatabase(prismaClient);
    await prismaClient.$disconnect();
  });

  describe('Store 기능 테스트', () => {
    it('POST /api/store - 스토어 생성', async () => {
      const res = await request(app)
        .post('/api/store')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: '테스트상점',
          address: '서울시 강남구',
          detailAddress: '101동 202호',
          phoneNumber: '01012345678',
          content: '테스트 상점입니다.',
          image: 'https://example.com/store.jpg',
        });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe('테스트상점');
      storeId = res.body.id;
    });

    it('PATCH /api/store - 스토어 수정', async () => {
      const res = await request(app)
        .patch(`/api/store/${storeId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: '수정된상점명',
          address: '서울시 서초구',
          detailAddress: '303호',
          phoneNumber: '01087654321',
          content: '수정된 내용입니다.',
          image: 'https://example.com/updated.jpg',
        });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('수정된상점명');
    });

    it('POST /api/store - 중복 등록 실패', async () => {
      const res = await request(app)
        .post('/api/store')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: '중복상점',
          address: '서울시 강남구',
          detailAddress: '101동 202호',
          phoneNumber: '01099999999',
          content: '중복 상점입니다.',
          image: 'https://example.com/store2.jpg',
        });

      expect(res.status).toBe(409);
      expect(res.body.message).toContain('already exists');
    });

    it('POST /api/store - 유효성 실패 (필드 누락)', async () => {
      const res = await request(app)
        .post('/api/store')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: '',
          address: '',
          detailAddress: '',
          phoneNumber: 'abc',
          content: '유효성 실패',
          image: 'not-a-url',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBeDefined();
    });

    it('PATCH /api/store - 유효성 실패', async () => {
      const res = await request(app)
        .patch(`/api/store/${storeId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'x',
          address: '',
          detailAddress: '',
          phoneNumber: '123',
          content: '',
          image: 'invalid-url',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBeDefined();
    });

    it('GET /api/store/detail/my - 내 스토어 조회', async () => {
      const res = await request(app)
        .get('/api/store/detail/my')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(typeof res.body.favoriteCount).toBe('number');
      expect(typeof res.body.productCount).toBe('number');
      expect(typeof res.body.monthFavoriteCount).toBe('number');
      expect(typeof res.body.totalSoldCount).toBe('number');
    });

    it('GET /api/store/:storeId - 특정 스토어 조회', async () => {
      const res = await request(app).get(`/api/store/${storeId}`);

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('수정된상점명');
      expect(typeof res.body.favoriteCount).toBe('number');
    });

    it('GET /api/store/:storeId - 존재하지 않는 스토어 조회', async () => {
      const res = await request(app).get(`/api/store/non-existent-id`);
      expect(res.status).toBe(404);
      expect(res.body.message).toContain('not found');
    });

    describe('GET /api/store/detail/my/product - 내 스토어 상품 목록 조회', () => {
      beforeAll(async () => {
        const category = await prismaClient.category.create({
          data: {
            id: 'cat-1',
            name: 'TOP',
          },
        });

        await prismaClient.product.createMany({
          data: [
            {
              name: '상품A',
              price: 10000,
              image: 'https://example.com/a.jpg',
              content: '상품A 설명',
              storeId,
              categoryId: category.id,
            },
            {
              name: '상품B',
              price: 20000,
              image: 'https://example.com/b.jpg',
              content: '상품B 설명',
              storeId,
              categoryId: category.id,
            },
            {
              name: '상품C',
              price: 30000,
              image: 'https://example.com/c.jpg',
              content: '상품C 설명',
              storeId,
              categoryId: category.id,
            },
          ],
        });
      });

      it('내 스토어의 상품 목록을 조회한다 (기본 페이지)', async () => {
        const res = await request(app)
          .get('/api/store/detail/my/product')
          .set('Authorization', `Bearer ${accessToken}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.list)).toBe(true);
        expect(typeof res.body.totalCount).toBe('number');
        expect(res.body.list.length).toBeLessThanOrEqual(10);
      });

      it('페이징 파라미터 적용 시 정확한 응답을 반환한다', async () => {
        const res = await request(app)
          .get('/api/store/detail/my/product?page=1&pageSize=2')
          .set('Authorization', `Bearer ${accessToken}`);

        expect(res.status).toBe(200);
        expect(res.body.list.length).toBeLessThanOrEqual(2);
        expect(res.body.totalCount).toBeGreaterThanOrEqual(3);
      });
    });
  });

  describe('Authorization (인증/인가) 테스트', () => {
    it('POST /api/store - 인증 없이 요청 시 401 반환', async () => {
      const res = await request(app).post('/api/store').send({
        name: '미인증상점',
        address: '서울시',
        detailAddress: '101호',
        phoneNumber: '01000000000',
        content: '비인증',
        image: 'https://example.com/img.jpg',
      });

      expect(res.status).toBe(401);
    });

    it('POST /api/store - BUYER 타입이 접근 시 403 반환', async () => {
      const res = await request(app)
        .post('/api/store')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          name: '구매자상점',
          address: '부산시',
          detailAddress: '202호',
          phoneNumber: '01000000000',
          content: '잘못된 접근',
          image: 'https://example.com/buyer.jpg',
        });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('판매자만 접근 가능합니다.');
    });
  });
});
