import request from 'supertest';
import app from '../app';
import { clearDatabase } from '../lib/testUtils';
import { prismaClient } from '../lib/prismaClient';
import { GradeName, CategoryName } from '@prisma/client';

const gradeData = {
  id: 'grade_green',
  name: GradeName.Green,
  rate: 5,
  minAmount: 100000,
};

const userData = {
  id: 'userId',
  name: '테스트 buyer',
  email: 'buyer@test.com',
  password: 'hashedPassword',
};

const storeData = {
  id: 'storeId',
  name: '너이키',
  userId: userData.id,
  address: '서울',
  phoneNumber: '123-1234',
  content: '스포츠 용품',
  image: 'imageURL',
};

const categoryData = {
  id: 'categoryId',
  name: CategoryName.BOTTOM,
};

const productData = {
  id: 'productId',
  storeId: storeData.id,
  categoryId: categoryData.id,
  name: '청바지',
  price: 25000,
  image: 'imageURL',
  discountRate: 10,
  discountStartTime: '2025-06-17T01:49:11.128Z',
  discountEndTime: '2025-06-27T01:49:11.128Z',
};

const sizeData = {
  id: 'sizeId',
  name: 'L',
  size: { en: 'L', ko: '라지' },
};

const stockData = {
  id: 'stockId',
  productId: productData.id,
  sizeId: sizeData.id,
  quantity: 100,
};

const cartData = {
  id: 'cartId',
  buyerId: userData.id,
};

const cartItemData = {
  id: 'cartItemId',
  cartId: cartData.id,
  productId: productData.id,
  sizeId: sizeData.id,
  quantity: 2,
};

describe('장바구니 API 테스트', () => {
  beforeEach(async () => {
    await clearDatabase(prismaClient);

    await prismaClient.grade.create({
      data: gradeData,
    });

    await prismaClient.user.create({
      data: userData,
    });

    await prismaClient.store.create({
      data: storeData,
    });

    await prismaClient.category.create({
      data: categoryData,
    });

    await prismaClient.product.create({
      data: productData,
    });

    await prismaClient.size.create({
      data: sizeData,
    });

    await prismaClient.stock.create({
      data: stockData,
    });
  });

  afterAll(async () => {
    await prismaClient.$disconnect();
  });

  describe('POST /cart', () => {
    test.skip('필수 값이 누락되면 400을 반환한다', async () => {
      const response = await request(app).post('/cart').send({});
      expect(response.status).toBe(400);
    });

    test.skip('인증되지 않은 유저는 401을 반환한다', async () => {
      const response = await request(app).post('/cart').set('Authorization', '').send(cartData);
      expect(response.status).toBe(401);
    });

    test.skip('접근 권한이 없는 유저는 403을 반환한다', async () => {
      const otherUserToken = 'dummy.other.token';
      const response = await request(app)
        .post('/cart')
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send(cartData);
      expect(response.status).toBe(403);
    });
    test('장바구니 등록에 성공하면 201을 반환한다', async () => {
      const response = await request(app).post('/cart').send(cartData);
      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        id: expect.any(String),
        buyerId: userData.id,
      });
    });

    describe('GET /cart', () => {
      test.skip('인증되지 않은 유저는 401을 반환한다', async () => {
        const response = await request(app).get('/cart').set('Authorization', '');
        expect(response.status).toBe(401);
      });

      test.skip('접근 권한이 없는 유저는 403을 반환한다', async () => {
        const otherUserToken = 'dummy.other.token';
        const response = await request(app)
          .get('/cart')
          .set('Authorization', `Bearer ${otherUserToken}`);
        expect(response.status).toBe(403);
      });

      test('존재하지 않는 장바구니를 조회하면 404를 반환한다', async () => {
        const response = await request(app).get('/cart').query({ buyerId: 'error-buyer-id' });

        expect(response.status).toBe(404);
        expect(response.body).toMatchObject({
          error: 'Cart not found',
        });
      });

      test('장바구니 조회에 성공하면 200을 반환한다', async () => {
        await prismaClient.cart.create({
          data: cartData,
        });

        await prismaClient.cartItem.create({
          data: cartItemData,
        });

        const response = await request(app).get('/cart').query({ buyerId: cartData.buyerId });

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
    describe('PATCH /cart', () => {
      const updateData = {
        productId: cartItemData.productId,
        sizes: [
          {
            sizeId: cartItemData.sizeId,
            quantity: 5,
          },
        ],
      };

      test.skip('필수 값이 누락되면 400을 반환한다', async () => {
        const response = await request(app).patch('/cart').send({});
        expect(response.status).toBe(400);
      });

      test.skip('인증되지 않은 유저는 401을 반환한다', async () => {
        const response = await request(app)
          .patch('/cart')
          .set('Authorization', '')
          .send(updateData);
        expect(response.status).toBe(401);
      });

      test.skip('접근 권한이 없는 유저는 403을 반환한다', async () => {
        const otherUserToken = 'dummy.other.token';
        const response = await request(app)
          .patch('/cart')
          .set('Authorization', `Bearer ${otherUserToken}`)
          .send(cartData);
        expect(response.status).toBe(403);
      });

      test('장바구니에 상품을 추가하거나 수정하면 200을 반환한다', async () => {
        await prismaClient.cart.create({
          data: cartData,
        });

        await prismaClient.cartItem.create({
          data: cartItemData,
        });

        const response = await request(app)
          .patch('/cart')
          .query({ buyerId: cartData.buyerId })
          .send(updateData);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true); 
        expect(response.body.length).toBeGreaterThan(0); 

        const updatedItem = response.body[0];
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
            buyerId: userData.id,
          },
        });
      });
    });

    describe('GET /cart/:id', () => {
      test.skip('인증되지 않은 유저는 401을 반환한다', async () => {
        const response = await request(app).get('/cart/Id').set('Authorization', '');
        expect(response.status).toBe(401);
      });

      test.skip('접근 권한이 없는 유저는 403을 반환한다', async () => {
        const otherUserToken = 'dummy.other.token';
        const response = await request(app)
          .get('/cart/Id')
          .set('Authorization', `Bearer ${otherUserToken}`);
        expect(response.status).toBe(403);
      });

      test('cartItemId가 존재하지 않는다면 404를 반환한다', async () => {
        await prismaClient.cart.create({
          data: cartData,
        });

        const response = await request(app).get(`/cart/errorId`);

        expect(response.status).toBe(404);
        expect(response.body.error).toBe(`Cart item not found`);
      });
      test('cartItemId로 검색하여 상품의 상세보기에 성공하면 200을 반환한다', async () => {
        await prismaClient.cart.create({
          data: cartData,
        });

        await prismaClient.cartItem.create({
          data: cartItemData,
        });

        const response = await request(app).get(`/cart/${cartItemData.id}`);

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
            buyerId: userData.id,
          },
        });
      });
    });
    describe('DELETE /cart/:id', () => {
      test.skip('인증되지 않은 유저는 401을 반환한다', async () => {
        const response = await request(app).delete('/cart/Id').set('Authorization', '');
        expect(response.status).toBe(401);
      });

      test.skip('접근 권한이 없는 유저는 403을 반환한다', async () => {
        const otherUserToken = 'dummy.other.token';
        const response = await request(app)
          .delete('/cart/Id')
          .set('Authorization', `Bearer ${otherUserToken}`);
        expect(response.status).toBe(403);
      });

      test('cartItemId가 존재하지 않는다면 404를 반환한다', async () => {
        await prismaClient.cart.create({
          data: cartData,
        });

        const response = await request(app).delete(`/cart/errorId`);

        expect(response.status).toBe(404);
        expect(response.body.error).toBe(`Cart item not found`);
      });
      test('cartItem 삭제에 성공하면 204를 반환한다', async () => {
        await prismaClient.cart.create({
          data: cartData,
        });

        await prismaClient.cartItem.create({
          data: cartItemData,
        });

        const response = await request(app).delete(`/cart/${cartItemData.id}`);

        expect(response.status).toBe(204);

        const response2 = await request(app).get(`/cart/${cartItemData.id}`);

        expect(response2.status).toBe(404);
      });
    });
  });
});
