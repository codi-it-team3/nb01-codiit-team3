import request from 'supertest';
import app from '../app';
import { prismaClient } from '../lib/prismaClient';
import { clearDatabase } from '../lib/testUtils';

describe('Product API 통합 테스트 (CRUD)', () => {
  let storeId: string;
  let categoryId: string;
  let sizeId: number;
  let productId: string;

  beforeAll(async () => {
    await clearDatabase(prismaClient);

    await prismaClient.grade.create({
      data: {
        id: 'grade_green',
        name: '그린',
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
      data: { name: '상의' },
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
      .post('/products')
      .send({
        name: '테스트 상품',
        price: 15000,
        storeId,
        categoryId,
        stocks: [{ sizeId, quantity: 10 }],
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('테스트 상품');
    productId = res.body.id;
  });

  it('상품 목록을 조회할 수 있다', async () => {
    const res = await request(app).get('/products');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.list)).toBe(true);
    expect(res.body.list.length).toBeGreaterThan(0);
  });

  it('상품 상세를 조회할 수 있다', async () => {
    const res = await request(app).get(`/products/${productId}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(productId);
    expect(res.body.name).toBe('테스트 상품');
  });

  it('상품을 수정할 수 있다', async () => {
    const res = await request(app).patch(`/products/${productId}`).send({
      price: 9900,
    });

    expect(res.status).toBe(200);
    expect(res.body.price).toBe(9900);
  });

  it('상품을 삭제할 수 있다', async () => {
    const res = await request(app).delete(`/products/${productId}`);
    expect(res.status).toBe(204);
  });

  it('필수 필드가 누락된 상품 등록 시 400 반환', async () => {
    //name 필드를 뺀 상태
    const res = await request(app)
      .post('/products')
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
    const res = await request(app).get(`/products/${productId}`);
    expect(res.status).toBe(404);
  });

  it('존재하지 않는 상품 ID로 상세 조회 시 404 반환', async () => {
    const res = await request(app).get('/products/99999999');
    expect(res.status).toBe(404);
    expect(res.body.message).toBe(`product with id 99999999 not found`);
  });

  it('존재하지 않는 상품 ID로 수정 시 404 반환', async () => {
    const res = await request(app).patch('/products/99999999').send({ price: 9999 });
    expect(res.status).toBe(404);
    expect(res.body.message).toBe(`product with id 99999999 not found`);
  });

  it('존재하지 않는 상품 ID로 삭제 시 404 반환', async () => {
    const nonExistentId = '99999999';
    const res = await request(app).delete(`/products/${nonExistentId}`);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe(`product with id ${nonExistentId} not found`);
  });
});
