import request from 'supertest';
import app from '../app';
import { clearDatabase } from '../lib/testUtils';
import { prismaClient } from '../lib/prismaClient';
import {
  gradeData,
  buyerUserData,
  storeData,
  categoryData,
  productData,
  sizeData,
  stockData,
  cartData,
  cartItemData,
  seedTestData,
  seedCartTestData,
  buyerUserLogin,
  sellerUserLogin,
} from '../lib/utils/cartTestUtil';

describe('장바구니 API 테스트', () => {
  beforeEach(async () => {
    await clearDatabase(prismaClient);
    await seedTestData();
  });

  afterAll(async () => {
    await prismaClient.$disconnect();
  });

  describe('POST /api/cart', () => {
    test.skip('필수 값이 누락되면 400을 반환한다', async () => {
      const { agent } = await buyerUserLogin();
      const response = await agent.post('/api/cart').send({ buyerId: null });
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('buyerId가 존재하지 않습니다.');
    });

    test('인증되지 않은 유저는 401을 반환한다', async () => {
      const response = await request(app).post('/api/cart').send(cartData);
      expect(response.status).toBe(401);
    });

    test('접근 권한이 없는 유저는 403을 반환한다', async () => {
      const { agent } = await sellerUserLogin();
      const response = await agent.post('/api/cart').send(cartData);
      expect(response.status).toBe(403);
    });
    test('장바구니 등록에 성공하면 201을 반환한다', async () => {
      const { agent } = await buyerUserLogin();
      const response = await agent.post('/api/cart').send(cartData);
      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        id: expect.any(String),
        buyerId: buyerUserData.id,
      });
    });

    describe('GET /api/cart', () => {
      test.skip('필수 값이 누락되면 400을 반환한다', async () => {
        const { agent } = await buyerUserLogin();
        const response = await agent.get('/api/cart');
        expect(response.status).toBe(400);
      });

      test('인증되지 않은 유저는 401을 반환한다', async () => {
        await seedCartTestData();
        const response = await request(app).get('/api/cart');
        expect(response.status).toBe(401);
      });

      test('접근 권한이 없는 유저는 403을 반환한다', async () => {
        const { agent } = await sellerUserLogin();
        const response = await agent.get('/api/cart');
        expect(response.status).toBe(403);
      });

      test('존재하지 않는 장바구니를 조회하면 404를 반환한다', async () => {
        const { agent } = await buyerUserLogin();
        const response = await agent.get('/api/cart');

        expect(response.status).toBe(404);
      });

      test('장바구니 조회에 성공하면 200을 반환한다', async () => {
        await seedCartTestData();

        const { agent } = await buyerUserLogin();
        const response = await agent.get('/api/cart');

        expect(response.status).toBe(200);

        expect(response.body).toMatchObject({
          id: cartData.id,
          buyerId: cartData.buyerId,
          items: expect.any(Array),
        });

        expect(response.body.items.length).toBeGreaterThan(0);

        expect(response.body.items[0]).toMatchObject({
          id: cartItemData.id,
          productId: cartItemData.productId,
          sizeId: cartItemData.sizeId,
        });
      });
    });
    describe('PATCH /api/cart', () => {
      const updateData = {
        cartId: cartItemData.cartId,
        productId: cartItemData.productId,
        sizeId: cartItemData.sizeId,
        quantity: 5,
      };

      test('장바구니에 담는 수량이 재고보다 초과하면 400을 반환한다', async () => {
        const NotFoundUpdateData = {
          cartId: cartItemData.cartId,
          productId: cartItemData.productId,
          sizeId: cartItemData.sizeId,
          quantity: 200,
        };
        await seedCartTestData();
        const { agent } = await buyerUserLogin();
        const response = await agent.patch('/api/cart').send(NotFoundUpdateData);
        expect(response.status).toBe(400);
      });

      test('인증되지 않은 유저는 401을 반환한다', async () => {
        await seedCartTestData();
        const response = await request(app).patch('/api/cart').send(updateData);
        expect(response.status).toBe(401);
      });

      test('접근 권한이 없는 유저는 403을 반환한다', async () => {
        await seedCartTestData();
        const { agent } = await sellerUserLogin();
        const response = await agent.patch('/api/cart').send(updateData);
        expect(response.status).toBe(403);
      });

      test('장바구니에 상품을 추가하거나 수정하면 200을 반환한다', async () => {
        await seedCartTestData();
        const { agent } = await buyerUserLogin();
        const response = await agent.patch('/api/cart').send(updateData);

        expect(response.status).toBe(200);

        const updatedItem = response.body;
        expect(updatedItem).toMatchObject({
          id: cartItemData.id,
          cartId: cartData.id,
          productId: productData.id,
          sizeId: sizeData.id,
          quantity: expect.any(Number),
          product: {
            id: productData.id,
            storeId: storeData.id,
            name: productData.name,
            price: productData.price,
            image: productData.image,
            discountRate: productData.discountRate,
            store: {
              id: storeData.id,
              name: storeData.name,
              address: storeData.address,
              phoneNumber: storeData.phoneNumber,
              content: storeData.content,
              image: storeData.image,
            },
            stocks: expect.any(Array),
          },
          cart: {
            id: cartData.id,
            buyerId: buyerUserData.id,
          },
        });
      });
    });

    describe('GET /api/cart/:id', () => {
      test('인증되지 않은 유저는 401을 반환한다', async () => {
        const response = await request(app).get(`/api/cart/${cartItemData.id}`);
        expect(response.status).toBe(401);
      });

      test('접근 권한이 없는 유저는 403을 반환한다', async () => {
        await seedCartTestData();
        const { agent } = await sellerUserLogin();
        const response = await agent.get(`/api/cart/${cartItemData.id}`);
        expect(response.status).toBe(403);
      });

      test('cartItemId가 존재하지 않는다면 404를 반환한다', async () => {
        await seedCartTestData();
        const { agent } = await buyerUserLogin();
        const response = await agent.get(`/api/cart/errorId`);

        expect(response.status).toBe(404);
      });
      test('cartItemId로 검색하여 상품의 상세보기에 성공하면 200을 반환한다', async () => {
        await seedCartTestData();
        const { agent } = await buyerUserLogin();
        const response = await agent.get(`/api/cart/${cartItemData.id}`);

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
          id: cartItemData.id,
          cartId: cartData.id,
          productId: productData.id,
          sizeId: sizeData.id,
          quantity: expect.any(Number),
          product: {
            id: productData.id,
            storeId: storeData.id,
            name: productData.name,
            price: productData.price,
            image: productData.image,
            discountRate: productData.discountRate,
            store: {
              id: storeData.id,
              name: storeData.name,
              address: storeData.address,
              phoneNumber: storeData.phoneNumber,
              content: storeData.content,
              image: storeData.image,
            },
            stocks: expect.any(Array),
          },
          cart: {
            id: cartData.id,
            buyerId: buyerUserData.id,
          },
        });
      });
    });

    describe('DELETE /api/cart/:id', () => {
      test('인증되지 않은 유저는 401을 반환한다', async () => {
        await buyerUserLogin();
        const response = await request(app).delete(`/api/cart/${cartItemData.id}`);
        expect(response.status).toBe(401);
      });

      test('접근 권한이 없는 유저는 403을 반환한다', async () => {
        await seedCartTestData();
        const { agent } = await sellerUserLogin();
        const response = await agent.delete(`/api/cart/${cartItemData.id}`);
        expect(response.status).toBe(403);
      });

      test('cartItemId가 존재하지 않는다면 404를 반환한다', async () => {
        await seedCartTestData();
        const { agent } = await buyerUserLogin();
        const response = await agent.delete(`/api/cart/errorId`);
        expect(response.status).toBe(404);
      });

      test('cartItem 삭제에 성공하면 204를 반환한다', async () => {
        await seedCartTestData();
        const { agent } = await buyerUserLogin();

        const response = await agent.delete(`/api/cart/${cartItemData.id}`);

        expect(response.status).toBe(204);
      });
    });
  });
});
