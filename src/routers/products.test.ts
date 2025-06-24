import request from 'supertest';
import app from '../app';
import { prismaClient } from '../lib/prismaClient';
import { clearDatabase } from '../lib/testUtils';

type ProductListItem = {
  id: string;
  name: string;
  price: number;
  discountRate: number | null;
  discountPrice: number;
  isSoldOut: boolean;
  reviewsCount: number;
  sales: number;
  categoryId: string;
  image: string;
  createdAt: string;
};

describe('Product API 통합 테스트 (CRUD)', () => {
  let storeId: string;
  let categoryId: string;
  let sizeId: string;
  let productId: string;
  let productIdForUpdate: string;

  beforeAll(async () => {
    await clearDatabase(prismaClient);

    await prismaClient.grade.create({
      data: {
        id: 'grade_green',
        name: 'Green',
        rate: 0,
        minAmount: 0,
      },
    });

    const user = await prismaClient.user.create({
      data: {
        name: '테스트유저',
        email: 'test@example.com',
        password: 'hashed-password',
        gradeId: 'grade_green',
        type: 'SELLER',
      },
    });

    const store = await prismaClient.store.create({
      data: {
        name: '테스트스토어',
        address: '서울시 강남구',
        phoneNumber: '010-0000-0000',
        content: '설명',
        userId: user.id,
      },
    });
    storeId = store.id;

    const category = await prismaClient.category.create({
      data: { name: 'TOP' },
    });
    categoryId = category.id;

    const size = await prismaClient.size.create({
      data: {
        name: 'L',
        size: { width: 30, height: 40 },
      },
    });
    sizeId = size.id;
  });

  afterAll(async () => {
    await prismaClient.$disconnect();
  });

  it('상품을 등록할 수 있다', async () => {
    const res = await request(app)
      .post('/api/products')
      .send({
        name: '테스트 상품',
        price: 15000,
        storeId,
        categoryId,
        stocks: [{ sizeId, quantity: 10 }],
        image: 'https://example.com/image.jpg',
        content: '상세 설명',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('테스트 상품');
    expect(res.body.content).toBe('상세 설명');
    expect(res.body.image).toBeDefined();
    productId = res.body.id;
  });

  it('stocks 없이 수정 테스트용 상품을 등록한다', async () => {
    const res = await request(app)
      .post('/api/products')
      .send({
        name: '수정 테스트 상품',
        price: 17000,
        storeId,
        categoryId,
        stocks: [{ sizeId, quantity: 10 }],
        image: 'https://example.com/update.jpg',
        content: '업데이트용 상품',
      });

    expect(res.status).toBe(201);
    productIdForUpdate = res.body.id;
  });

  it('할인 기간과 할인율이 반영된 상품을 등록할 수 있다', async () => {
    const res = await request(app)
      .post('/api/products')
      .send({
        name: '할인 상품',
        price: 20000,
        storeId,
        categoryId,
        stocks: [{ sizeId, quantity: 5 }],
        image: 'example.jpg',
        content: '설명',
        discountRate: 20,
        discountStartTime: new Date().toISOString(),
        discountEndTime: new Date(Date.now() + 86400000).toISOString(),
      });

    expect(res.status).toBe(201);
    expect(res.body.discountRate).toBe(20);
    expect(res.body.discountStartTime).toBeDefined();
    expect(res.body.discountEndTime).toBeDefined();
  });

  it('상품 목록을 조회할 수 있다', async () => {
    const res = await request(app).get('/api/products');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.list)).toBe(true);
    expect(typeof res.body.total).toBe('number');
    expect(res.body.list.length).toBeGreaterThan(0);
  });

  it('상품 상세를 조회할 수 있다', async () => {
    const res = await request(app).get(`/api/products/${productId}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(productId);
    expect(res.body.name).toBe('테스트 상품');
    expect(res.body.discountPrice).toBeDefined();
    expect(Array.isArray(res.body.category)).toBe(true);
    expect(Array.isArray(res.body.stocks)).toBe(true);
  });

  it('상품을 수정할 수 있다', async () => {
    const res = await request(app).patch(`/api/products/${productId}`).send({ price: 9900 });

    expect(res.status).toBe(200);
    expect(res.body.price).toBe(9900);
  });

  it('stocks 없이 상품을 수정할 수 있다', async () => {
    const updateRes = await request(app)
      .patch(`/api/products/${productIdForUpdate}`)
      .send({ name: '수정된 상품명' });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.name).toBe('수정된 상품명');
  });

  it('상품을 삭제할 수 있다', async () => {
    const res = await request(app).delete(`/api/products/${productId}`);
    expect(res.status).toBe(204);
  });

  it('필수 필드가 누락된 상품 등록 시 400 반환', async () => {
    const res = await request(app)
      .post('/api/products')
      .send({
        price: 10000,
        storeId,
        categoryId,
        stocks: [{ sizeId, quantity: 5 }],
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('invalid product fields');
  });

  it('이미 삭제된 상품 조회 시 404 반환', async () => {
    const res = await request(app).get(`/api/products/${productId}`);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe(`product with id ${productId} not found`);
  });

  it('존재하지 않는 상품 ID로 상세 조회 시 404 반환', async () => {
    const res = await request(app).get('/api/products/99999999');
    expect(res.status).toBe(404);
    expect(res.body.message).toBe(`product with id 99999999 not found`);
  });

  it('존재하지 않는 상품 ID로 수정 시 404 반환', async () => {
    const res = await request(app).patch('/api/products/99999999').send({ price: 9999 });
    expect(res.status).toBe(404);
    expect(res.body.message).toBe(`product with id 99999999 not found`);
  });

  it('존재하지 않는 상품 ID로 삭제 시 404 반환', async () => {
    const nonExistentId = '99999999';
    const res = await request(app).delete(`/api/products/${nonExistentId}`);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe(`product with id ${nonExistentId} not found`);
  });

  it('할인 기간 없이 할인율만 포함해 등록할 수 있다', async () => {
    const res = await request(app)
      .post('/api/products')
      .send({
        name: '할인율만 상품',
        price: 18000,
        storeId,
        categoryId,
        stocks: [{ sizeId, quantity: 7 }],
        image: 'https://example.com/image2.jpg',
        content: '할인율만 있음',
        discountRate: 10,
      });

    expect(res.status).toBe(201);
    expect(res.body.discountRate).toBe(10);
    expect(res.body.discountStartTime).toBeNull();
    expect(res.body.discountEndTime).toBeNull();
  });

  it('파라미터 없이 기본 목록 조회 시 최신순으로 반환된다', async () => {
    const res = await request(app).get('/api/products');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.list)).toBe(true);
    expect(res.body.page).toBe(1);
    expect(res.body.total).toBeGreaterThan(0);
  });

  describe('상품 목록 정렬 및 필터 테스트', () => {
    it('가격 오름차순 정렬이 적용된다', async () => {
      const res = await request(app).get('/api/products?sort=price_low');
      expect(res.status).toBe(200);

      const prices = (res.body.list as ProductListItem[]).map((p) => p.price);
      const sorted = [...prices].sort((a, b) => a - b);
      expect(prices).toEqual(sorted);
    });

    it('가격 내림차순 정렬이 적용된다', async () => {
      const res = await request(app).get('/api/products?sort=price_high');
      expect(res.status).toBe(200);

      const prices = (res.body.list as ProductListItem[]).map((p) => p.price);
      const sorted = [...prices].sort((a, b) => b - a);
      expect(prices).toEqual(sorted);
    });

    it('카테고리 ID로 필터링할 수 있다', async () => {
      const res = await request(app).get(`/api/products?categoryId=${categoryId}`);
      expect(res.status).toBe(200);
      expect((res.body.list as ProductListItem[]).every((p) => p.categoryId === categoryId)).toBe(
        true,
      );
    });

    it('이름 검색 필터가 적용된다', async () => {
      const res = await request(app).get('/api/products?name=테스트');
      expect(res.status).toBe(200);
      expect((res.body.list as ProductListItem[]).every((p) => p.name.includes('테스트'))).toBe(
        true,
      );
    });

    it('최소/최대 가격 필터가 적용된다', async () => {
      const res = await request(app).get('/api/products?minPrice=10000&maxPrice=20000');
      expect(res.status).toBe(200);
      expect(
        (res.body.list as ProductListItem[]).every((p) => p.price >= 10000 && p.price <= 20000),
      ).toBe(true);
    });

    it('비어있는 목록 조회 시 빈 배열을 반환한다', async () => {
      const res = await request(app).get('/api/products?name=존재하지않는상품이름');
      expect(res.status).toBe(200);
      expect(res.body.list).toEqual([]);
      expect(res.body.total).toBe(0);
    });

    it('리뷰 평점 정렬이 적용된다', async () => {
      const res = await request(app).get('/api/products?sort=rating');
      expect(res.status).toBe(200);

      const ratings = (res.body.list as ProductListItem[]).map((p) => p.reviewsCount);
      const sorted = [...ratings].sort((a, b) => b - a);
      expect(ratings).toEqual(sorted);
    });

    it('리뷰 수 정렬이 적용된다', async () => {
      const res = await request(app).get('/api/products?sort=review');
      expect(res.status).toBe(200);

      const reviewCounts = (res.body.list as ProductListItem[]).map((p) => p.reviewsCount);
      const sorted = [...reviewCounts].sort((a, b) => b - a);
      expect(reviewCounts).toEqual(sorted);
    });

    it('판매량 정렬이 적용된다', async () => {
      const res = await request(app).get('/api/products?sort=sales');
      expect(res.status).toBe(200);

      const salesCounts = (res.body.list as ProductListItem[]).map((p) => p.sales);
      const sorted = [...salesCounts].sort((a, b) => b - a);
      expect(salesCounts).toEqual(sorted);
    });

    it('즐겨찾기한 스토어의 상품만 필터링된다', async () => {
      const user = await prismaClient.user.create({
        data: {
          name: '즐겨찾기 유저',
          email: 'favorite@example.com',
          password: 'hashed',
          gradeId: 'grade_green',
        },
      });

      await prismaClient.favoriteStore.create({
        data: {
          userId: user.id,
          storeId,
        },
      });

      const fullRes = await request(app).get('/api/products');
      const fullCount = fullRes.body.total;

      const filteredRes = await request(app)
        .get('/api/products?favoriteOnly=true')
        .set('x-user-id', user.id);
      expect(filteredRes.status).toBe(200);
      expect(filteredRes.body.total).toBeLessThanOrEqual(fullCount);
    });
  });
});
