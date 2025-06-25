import request from 'supertest';
import app from '../app';
import { clearDatabase } from '../lib/testUtils';
import { prismaClient } from '../lib/prismaClient';
import { GradeName, CategoryName, PaymentStatus } from '@prisma/client';

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
  points: 1000,
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
};

const orderData = {
  id: 'orderId',
  userId: userData.id,
  name: '홍길동',
  phoneNumber: '010-1234-1234',
  address: '천안',
  subtotal: 45000,
  totalQuantity: 2,
  usePoint: 1000,
};

const orderItemData = {
  id: 'orderItemId',
  price: 22500,
  quantity: 2,
  productId: productData.id,
  sizeId: sizeData.id,
  orderId: orderData.id,
};

const paymentData = {
  id: 'paymentId',
  price: 44000,
  status: PaymentStatus.CompletedPayment,
  orderId: orderData.id,
};

describe('주문 API 테스트', () => {
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

    await prismaClient.cart.create({
      data: cartData,
    });

    await prismaClient.cartItem.create({
      data: cartItemData,
    });
  });

  afterAll(async () => {
    await prismaClient.$disconnect();
  });

  describe('POST /order', () => {
    test.skip('필수 값이 누락되면 400을 반환한다', async () => {
      const response = await request(app).post('/order').send({});
      expect(response.status).toBe(400);
    });

    test.skip('인증되지 않은 유저는 401을 반환한다', async () => {
      const response = await request(app).post('/order').set('Authorization', '').send(orderData);
      expect(response.status).toBe(401);
    });

    test.skip('접근 권한이 없는 유저는 403을 반환한다', async () => {
      const otherUserToken = 'dummy.other.token';
      const response = await request(app)
        .post('/order')
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send(cartData);
      expect(response.status).toBe(403);
    });

    test('사용자가 장바구니에 담은 상품으로 주문을 생성하면 201을 반환한다', async () => {
      const response = await request(app).post('/order').send(orderData);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        id: expect.any(String),
        name: orderData.name,
        phoneNumber: orderData.phoneNumber,
        address: orderData.address,
        subtotal: orderData.subtotal,
        totalQuantity: orderData.totalQuantity,
        usePoint: orderData.usePoint,
        orderItems: expect.any(Array),
        payments: {
          id: expect.any(String),
          price: expect.any(Number),
          status: PaymentStatus.CompletedPayment,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          orderId: expect.any(String),
        },
      });
    });

    describe('GET /order', () => {
      test.skip('인증되지 않은 유저는 401을 반환한다', async () => {
        const response = await request(app).get('/order').set('Authorization', '');
        expect(response.status).toBe(401);
      });

      test.skip('접근 권한이 없는 유저는 403을 반환한다', async () => {
        const otherUserToken = 'dummy.other.token';
        const response = await request(app)
          .get('/order')
          .set('Authorization', `Bearer ${otherUserToken}`);
        expect(response.status).toBe(403);
      });

      test('모든 주문 조회에 성공하면 200을 반환한다', async () => {
        await prismaClient.order.create({
          data: orderData,
        });

        await prismaClient.orderItem.create({
          data: orderItemData,
        });

        await prismaClient.payment.create({
          data: paymentData,
        });

        const response = await request(app).get('/order');

        expect(response.status).toBe(200);

        expect(response.body[0]).toMatchObject({
          id: orderData.id,
          name: orderData.name,
          phoneNumber: orderData.phoneNumber,
          address: orderData.address,
          subtotal: orderData.subtotal,
          totalQuantity: orderData.totalQuantity,
          usePoint: orderData.usePoint,
          orderItems: expect.any(Array),
          payments: {
            id: expect.any(String),
            price: paymentData.price,
            status: 'CompletedPayment',
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            orderId: orderData.id,
          },
        });
      });
    });
    describe('GET /order:id', () => {
      test.skip('인증되지 않은 유저는 401을 반환한다', async () => {
        const response = await request(app).get('/order/Id').set('Authorization', '');
        expect(response.status).toBe(401);
      });

      test.skip('접근 권한이 없는 유저는 403을 반환한다', async () => {
        const otherUserToken = 'dummy.other.token';
        const response = await request(app)
          .get('/order/Id')
          .set('Authorization', `Bearer ${otherUserToken}`);
        expect(response.status).toBe(403);
      });

      test('orderId가 존재하지 않는다면 404를 반환한다', async () => {
        await prismaClient.order.create({
          data: orderData,
        });

        const response = await request(app).get(`/order/errorId`);

        expect(response.status).toBe(404);
        expect(response.body.error).toBe(`Order not found`);
      });
      test('orderId로 검색하여 특정 주문의 상세 정보를 조회하면 200을 반환한다', async () => {
        await prismaClient.order.create({
          data: orderData,
        });

        await prismaClient.orderItem.create({
          data: orderItemData,
        });

        await prismaClient.payment.create({
          data: paymentData,
        });

        const response = await request(app).get(`/order/${orderData.id}`);

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
          id: orderData.id,
          name: orderData.name,
          phoneNumber: orderData.phoneNumber,
          address: orderData.address,
          usePoint: orderData.usePoint,
          subtotal: expect.any(Number),
          totalQuantity: expect.any(Number),
          createdAt: expect.any(String),
          orderItems: expect.any(Array),
          payments: {
            id: expect.any(String),
            price: expect.any(Number),
            status: PaymentStatus.CompletedPayment,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            orderId: orderData.id,
          },
        });
      });
    });

    describe('PATCH /order/:id', () => {
      test.skip('필수 값이 누락되면 400을 반환한다', async () => {
        const response = await request(app).patch('/order/Id').send({});
        expect(response.status).toBe(400);
      });

      test.skip('인증되지 않은 유저는 401을 반환한다', async () => {
        const response = await request(app)
          .patch('/order/Id')
          .set('Authorization', '')
          .send(orderData);
        expect(response.status).toBe(401);
      });

      test.skip('접근 권한이 없는 유저는 403을 반환한다', async () => {
        const otherUserToken = 'dummy.other.token';
        const response = await request(app)
          .patch('/order/Id')
          .set('Authorization', `Bearer ${otherUserToken}`)
          .send(cartData);
        expect(response.status).toBe(403);
      });

      test('orderId가 존재하지 않는다면 404를 반환한다', async () => {
        await prismaClient.order.create({
          data: orderData,
        });

        await prismaClient.orderItem.create({
          data: orderItemData,
        });

        await prismaClient.payment.create({
          data: paymentData,
        });

        const updateData = {
          name: '구매자',
          phoneNumber: '010-1234-1111',
          address: '서울',
          usePoint: 500,
        };
        const response = await request(app).patch(`/order/errorId`).send(updateData);

        expect(response.status).toBe(404);
        expect(response.body.error).toBe(`Order not found`);
      });
      test('구매자 정보를 수정하면 200을 반환한다', async () => {
        await prismaClient.order.create({
          data: orderData,
        });

        await prismaClient.orderItem.create({
          data: orderItemData,
        });

        await prismaClient.payment.create({
          data: paymentData,
        });

        const updateData = {
          name: '구매자',
          phoneNumber: '010-1234-1111',
          address: '서울',
          usePoint: 500,
        };

        const response = await request(app).patch(`/order/${orderData.id}`).send(updateData);

        expect(response.status).toBe(200);

        expect(response.body).toMatchObject({
          id: orderData.id,
          name: updateData.name,
          phoneNumber: updateData.phoneNumber,
          address: updateData.address,
          usePoint: updateData.usePoint,
          subtotal: expect.any(Number),
          totalQuantity: expect.any(Number),
          createdAt: expect.any(String),
          orderItems: expect.any(Array),
          payments: {
            id: expect.any(String),
            price: expect.any(Number),
            status: PaymentStatus.CompletedPayment,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            orderId: orderData.id,
          },
        });
      });
    });
    describe('DELETE /order/:id', () => {
      test.skip('인증되지 않은 유저는 401을 반환한다', async () => {
        const response = await request(app).delete('/order/Id').set('Authorization', '');
        expect(response.status).toBe(401);
      });

      test.skip('접근 권한이 없는 유저는 403을 반환한다', async () => {
        const otherUserToken = 'dummy.other.token';
        const response = await request(app)
          .delete('/order/Id')
          .set('Authorization', `Bearer ${otherUserToken}`);
        expect(response.status).toBe(403);
      });

      test('orderId가 존재하지 않는다면 404를 반환한다', async () => {
        await prismaClient.order.create({
          data: orderData,
        });

        const response = await request(app).delete(`/order/errorId`);

        expect(response.status).toBe(404);
        expect(response.body.error).toBe(`Order not found`);
      });
      test('order 삭제에 성공하면 204를 반환한다', async () => {
        const paymentData2 = {
          id: 'paymentId',
          price: 44000,
          status: PaymentStatus.WaitingPayment,
          orderId: orderData.id,
        };

        await prismaClient.order.create({
          data: orderData,
        });

        await prismaClient.orderItem.create({
          data: orderItemData,
        });

        await prismaClient.payment.create({
          data: paymentData2,
        });

        const response = await request(app).delete(`/order/${orderData.id}`);

        expect(response.status).toBe(204);

        const response2 = await request(app).get(`/order/${orderData.id}`);

        expect(response2.status).toBe(404);
      });
    });
  });
});
