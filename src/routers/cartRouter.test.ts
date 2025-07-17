import request from 'supertest';
import app from '../app';
import { clearDatabase } from '../lib/testUtils';
import { prismaClient } from '../lib/prismaClient';
import * as cartTestUtil from '../lib/utils/cartTestUtil';

describe('장바구니 API 테스트', () => {
  beforeEach(async () => {
    await clearDatabase(prismaClient);
    await cartTestUtil.seedTestData();
  });

  afterAll(async () => {
    await prismaClient.$disconnect();
  });

  describe('POST /api/cart', () => {
    test.skip('필수 값이 누락되면 400을 반환한다', async () => {
      const { agent } = await cartTestUtil.buyerUserLogin();
      const response = await agent.post('/api/cart').send({ buyerId: null });
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('buyerId가 존재하지 않습니다.');
    });

    test('인증되지 않은 유저는 401을 반환한다', async () => {
      const response = await request(app).post('/api/cart').send(cartTestUtil.cartData);
      expect(response.status).toBe(401);
    });

    test('접근 권한이 없는 유저는 403을 반환한다', async () => {
      const { agent } = await cartTestUtil.sellerUserLogin();
      const response = await agent.post('/api/cart').send(cartTestUtil.cartData);
      expect(response.status).toBe(403);
    });
    test('장바구니 등록에 성공하면 201을 반환한다', async () => {
      const { agent } = await cartTestUtil.buyerUserLogin();
      const response = await agent.post('/api/cart').send(cartTestUtil.cartData);
      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        id: expect.any(String),
        buyerId: cartTestUtil.buyerUserData.id,
      });
    });

    describe('GET /api/cart', () => {
      test.skip('필수 값이 누락되면 400을 반환한다', async () => {
        const { agent } = await cartTestUtil.buyerUserLogin();
        const response = await agent.get('/api/cart');
        expect(response.status).toBe(400);
      });

      test('인증되지 않은 유저는 401을 반환한다', async () => {
        await cartTestUtil.seedCartTestData();
        const response = await request(app).get('/api/cart');
        expect(response.status).toBe(401);
      });

      test('접근 권한이 없는 유저는 403을 반환한다', async () => {
        const { agent } = await cartTestUtil.sellerUserLogin();
        const response = await agent.get('/api/cart');
        expect(response.status).toBe(403);
      });

      test('존재하지 않는 장바구니를 조회하면 404를 반환한다', async () => {
        const { agent } = await cartTestUtil.buyerUserLogin();
        const response = await agent.get('/api/cart');

        expect(response.status).toBe(404);
      });

      test('장바구니 조회에 성공하면 200을 반환한다', async () => {
        await cartTestUtil.seedCartTestData();

        const { agent } = await cartTestUtil.buyerUserLogin();
        const response = await agent.get('/api/cart');

        expect(response.status).toBe(200);

        expect(response.body).toMatchObject({
          id: cartTestUtil.cartData.id,
          buyerId: cartTestUtil.cartData.buyerId,
          items: expect.any(Array),
        });

        expect(response.body.items.length).toBeGreaterThan(0);

        expect(response.body.items[0]).toMatchObject({
          id: cartTestUtil.cartItemData.id,
          productId: cartTestUtil.cartItemData.productId,
          sizeId: cartTestUtil.cartItemData.sizeId,
        });
      });
    });
    describe('PATCH /api/cart', () => {
      const updateData = {
        cartId: cartTestUtil.cartItemData.cartId,
        productId: cartTestUtil.cartItemData.productId,
        sizeId: cartTestUtil.cartItemData.sizeId,
        quantity: 5,
      };

      test('장바구니에 담는 수량이 재고보다 초과하면 400을 반환한다', async () => {
        const NotFoundUpdateData = {
          cartId: cartTestUtil.cartItemData.cartId,
          productId: cartTestUtil.cartItemData.productId,
          sizeId: cartTestUtil.cartItemData.sizeId,
          quantity: 200,
        };
        await cartTestUtil.seedCartTestData();
        const { agent } = await cartTestUtil.buyerUserLogin();
        const response = await agent.patch('/api/cart').send(NotFoundUpdateData);
        expect(response.status).toBe(400);
      });

      test('인증되지 않은 유저는 401을 반환한다', async () => {
        await cartTestUtil.seedCartTestData();
        const response = await request(app).patch('/api/cart').send(updateData);
        expect(response.status).toBe(401);
      });

      test('접근 권한이 없는 유저는 403을 반환한다', async () => {
        await cartTestUtil.seedCartTestData();
        const { agent } = await cartTestUtil.sellerUserLogin();
        const response = await agent.patch('/api/cart').send(updateData);
        expect(response.status).toBe(403);
      });

      test('장바구니에 상품을 추가하거나 수정하면 200을 반환한다', async () => {
        await cartTestUtil.seedCartTestData();
        const { agent } = await cartTestUtil.buyerUserLogin();
        const response = await agent.patch('/api/cart').send(updateData);

        expect(response.status).toBe(200);

        const updatedItem = response.body;
        expect(updatedItem).toMatchObject({
          id: cartTestUtil.cartItemData.id,
          cartId: cartTestUtil.cartData.id,
          productId: cartTestUtil.productData.id,
          sizeId: cartTestUtil.sizeData.id,
          quantity: expect.any(Number),
          product: {
            id: cartTestUtil.productData.id,
            storeId: cartTestUtil.storeData.id,
            name: cartTestUtil.productData.name,
            price: cartTestUtil.productData.price,
            image: cartTestUtil.productData.image,
            discountRate: cartTestUtil.productData.discountRate,
            store: {
              id: cartTestUtil.storeData.id,
              name: cartTestUtil.storeData.name,
              address: cartTestUtil.storeData.address,
              phoneNumber: cartTestUtil.storeData.phoneNumber,
              content: cartTestUtil.storeData.content,
              image: cartTestUtil.storeData.image,
            },
            stocks: expect.any(Array),
          },
          cart: {
            id: cartTestUtil.cartData.id,
            buyerId: cartTestUtil.buyerUserData.id,
          },
        });
      });
    });

    describe('GET /api/cart/:id', () => {
      test('인증되지 않은 유저는 401을 반환한다', async () => {
        const response = await request(app).get(`/api/cart/${cartTestUtil.cartItemData.id}`);
        expect(response.status).toBe(401);
      });

      test('접근 권한이 없는 유저는 403을 반환한다', async () => {
        await cartTestUtil.seedCartTestData();
        const { agent } = await cartTestUtil.sellerUserLogin();
        const response = await agent.get(`/api/cart/${cartTestUtil.cartItemData.id}`);
        expect(response.status).toBe(403);
      });

      test('cartItemId가 존재하지 않는다면 404를 반환한다', async () => {
        await cartTestUtil.seedCartTestData();
        const { agent } = await cartTestUtil.buyerUserLogin();
        const response = await agent.get(`/api/cart/errorId`);

        expect(response.status).toBe(404);
      });
      test('cartItemId로 검색하여 상품의 상세보기에 성공하면 200을 반환한다', async () => {
        await cartTestUtil.seedCartTestData();
        const { agent } = await cartTestUtil.buyerUserLogin();
        const response = await agent.get(`/api/cart/${cartTestUtil.cartItemData.id}`);

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
          id: cartTestUtil.cartItemData.id,
          cartId: cartTestUtil.cartData.id,
          productId: cartTestUtil.productData.id,
          sizeId: cartTestUtil.sizeData.id,
          quantity: expect.any(Number),
          product: {
            id: cartTestUtil.productData.id,
            storeId: cartTestUtil.storeData.id,
            name: cartTestUtil.productData.name,
            price: cartTestUtil.productData.price,
            image: cartTestUtil.productData.image,
            discountRate: cartTestUtil.productData.discountRate,
            store: {
              id: cartTestUtil.storeData.id,
              name: cartTestUtil.storeData.name,
              address: cartTestUtil.storeData.address,
              phoneNumber: cartTestUtil.storeData.phoneNumber,
              content: cartTestUtil.storeData.content,
              image: cartTestUtil.storeData.image,
            },
            stocks: expect.any(Array),
          },
          cart: {
            id: cartTestUtil.cartData.id,
            buyerId: cartTestUtil.buyerUserData.id,
          },
        });
      });
    });

    describe('DELETE /api/cart/:id', () => {
      test('인증되지 않은 유저는 401을 반환한다', async () => {
        await cartTestUtil.buyerUserLogin();
        const response = await request(app).delete(`/api/cart/${cartTestUtil.cartItemData.id}`);
        expect(response.status).toBe(401);
      });

      test('접근 권한이 없는 유저는 403을 반환한다', async () => {
        await cartTestUtil.seedCartTestData();
        const { agent } = await cartTestUtil.sellerUserLogin();
        const response = await agent.delete(`/api/cart/${cartTestUtil.cartItemData.id}`);
        expect(response.status).toBe(403);
      });

      test('cartItemId가 존재하지 않는다면 404를 반환한다', async () => {
        await cartTestUtil.seedCartTestData();
        const { agent } = await cartTestUtil.buyerUserLogin();
        const response = await agent.delete(`/api/cart/errorId`);
        expect(response.status).toBe(404);
      });

      test('cartItem 삭제에 성공하면 204를 반환한다', async () => {
        await cartTestUtil.seedCartTestData();
        const { agent } = await cartTestUtil.buyerUserLogin();

        const response = await agent.delete(`/api/cart/${cartTestUtil.cartItemData.id}`);

        expect(response.status).toBe(204);
      });
    });
  });
});
