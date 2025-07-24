import request from 'supertest';
import app from '../app';
import { clearDatabase } from '../lib/testUtils';
import { prismaClient } from '../lib/prismaClient';
import { PaymentStatus } from '@prisma/client';
import * as orderTestUtil from '../lib/utils/orderTestUtil';

describe('주문 API 테스트', () => {
  beforeEach(async () => {
    await clearDatabase(prismaClient);
    await orderTestUtil.seedTestData();
  });

  afterAll(async () => {
    await prismaClient.$disconnect();
  });

  describe('POST /api/order', () => {
    const orderRequest = {
      name: '길동이',
      phoneNumber: '010-1234-1234',
      address: '서울',
      orderItems: [
        { productId: orderTestUtil.productData.id, sizeId: orderTestUtil.sizeData.id, quantity: 2 },
      ],
      usePoint: 1000,
    };
    const subtotal = orderTestUtil.productData.price * orderRequest.orderItems[0].quantity;
    const totalQuantity = orderRequest.orderItems[0].quantity;
    test('필수 값이 누락되면 400을 반환한다', async () => {
      const errorOrderRequest = {
        name: 1234,
        phoneNumber: '010-1234-1234',
        address: '서울',
        orderItems: [
          {
            productId: orderTestUtil.productData.id,
            sizeId: orderTestUtil.sizeData.id,
            quantity: 2,
          },
        ],
        usePoint: 1000,
      };
      const { agent } = await orderTestUtil.buyerUserLogin();
      const response = await agent.post('/api/order').send(errorOrderRequest);
      expect(response.status).toBe(400);
    });

    test.skip('인증되지 않은 유저는 401을 반환한다', async () => {
      const response = await request(app).post('/api/order').send(orderRequest);
      expect(response.status).toBe(401);
    });

    test('접근 권한이 없는 유저는 403을 반환한다', async () => {
      const { agent } = await orderTestUtil.sellerUserLogin();
      const response = await agent.post('/api/order').send(orderRequest);
      expect(response.status).toBe(403);
    });

    test('사용자가 주문을 생성하면 201을 반환한다', async () => {
      const { agent } = await orderTestUtil.buyerUserLogin();
      const response = await agent.post('/api/order').send(orderRequest);
      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        id: expect.any(String),
        name: orderRequest.name,
        phoneNumber: orderRequest.phoneNumber,
        address: orderRequest.address,
        subtotal: subtotal,
        totalQuantity: totalQuantity,
        usePoint: orderRequest.usePoint,
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

    describe('GET /api/order', () => {
      test('인증되지 않은 유저는 401을 반환한다', async () => {
        const response = await request(app).get('/api/order');
        expect(response.status).toBe(401);
      });

      test('접근 권한이 없는 유저는 403을 반환한다', async () => {
        const { agent } = await orderTestUtil.sellerUserLogin();
        const response = await agent.get('/api/order');
        expect(response.status).toBe(403);
      });

      test('주문이 완료된 건만 주문 조회에 성공하여 200을 반환한다', async () => {
        await orderTestUtil.seedOrderTestData();
        const { agent } = await orderTestUtil.buyerUserLogin();
        const response = await agent.get('/api/order?status=CompletedPayment&page=1&pageSize=10');

        expect(response.status).toBe(200);

        expect(response.body.data[0]).toMatchObject({
          id: orderTestUtil.orderData.id,
          name: orderTestUtil.orderData.name,
          phoneNumber: orderTestUtil.orderData.phoneNumber,
          address: orderTestUtil.orderData.address,
          subtotal: orderTestUtil.orderData.subtotal,
          totalQuantity: orderTestUtil.orderData.totalQuantity,
          usePoint: orderTestUtil.orderData.usePoint,
          orderItems: expect.any(Array),
          payments: {
            id: expect.any(String),
            price: orderTestUtil.paymentData.price,
            status: orderTestUtil.paymentData.status,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            orderId: orderTestUtil.orderData.id,
          },
        });
      });
    });
    describe('GET /api/order:id', () => {
      test('인증되지 않은 유저는 401을 반환한다', async () => {
        const response = await request(app).get('/api/order/Id');
        expect(response.status).toBe(401);
      });

      test('접근 권한이 없는 유저는 403을 반환한다', async () => {
        const { agent } = await orderTestUtil.sellerUserLogin();
        const response = await agent.get('/api/order');
        expect(response.status).toBe(403);
      });

      test('orderId로 검색하여 특정 주문의 상세 정보를 조회하면 200을 반환한다', async () => {
        await orderTestUtil.seedOrderTestData();
        const { agent } = await orderTestUtil.buyerUserLogin();
        const response = await agent.get(`/api/order/${orderTestUtil.orderData.id}`);

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
          id: orderTestUtil.orderData.id,
          name: orderTestUtil.orderData.name,
          phoneNumber: orderTestUtil.orderData.phoneNumber,
          address: orderTestUtil.orderData.address,
          usePoint: orderTestUtil.orderData.usePoint,
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
            orderId: orderTestUtil.orderData.id,
          },
        });
      });
    });

    describe('PATCH /api/order/:id', () => {
      const updateOrderRequest = {
        name: '둘리',
        phoneNumber: '010-1234-1234',
        address: '천안',
        orderItems: [
          {
            productId: orderTestUtil.productData.id,
            sizeId: orderTestUtil.sizeData.id,
            quantity: 2,
          },
        ],
        usePoint: 1000,
      };
      test('필수 값이 누락되면 400을 반환한다', async () => {
        const errorUpdateOrderRequest = {
          phoneNumber: '010-1234-1234',
          address: '천안',
          orderItems: [
            {
              productId: orderTestUtil.productData.id,
              sizeId: orderTestUtil.sizeData.id,
              quantity: 2,
            },
          ],
          usePoint: 1000,
        };
        const { agent } = await orderTestUtil.buyerUserLogin();
        const response = await agent
          .patch(`/api/order/${orderTestUtil.orderData.id}`)
          .send(errorUpdateOrderRequest);
        expect(response.status).toBe(400);
      });

      test.skip('인증되지 않은 유저는 401을 반환한다', async () => {
        await orderTestUtil.seedOrderTestData();
        const response = await request(app)
          .patch(`/api/order/${orderTestUtil.orderData.id}`)
          .send(updateOrderRequest);
        expect(response.status).toBe(401);
      });

      test('접근 권한이 없는 유저는 403을 반환한다', async () => {
        const { agent } = await orderTestUtil.sellerUserLogin();
        const response = await agent
          .patch(`/api/order/${orderTestUtil.orderData.id}`)
          .send(updateOrderRequest);
        expect(response.status).toBe(403);
      });

      test('orderId가 존재하지 않는다면 404를 반환한다', async () => {
        await orderTestUtil.seedOrderTestData();
        const { agent } = await orderTestUtil.buyerUserLogin();
        const response = await agent.patch(`/api/order/errorId`).send(updateOrderRequest);

        expect(response.status).toBe(404);
      });
      test('주문 정보를 수정하면 200을 반환한다', async () => {
        await orderTestUtil.seedOrderTestData();
        const { agent } = await orderTestUtil.buyerUserLogin();
        const response = await agent
          .patch(`/api/order/${orderTestUtil.orderData.id}`)
          .send(updateOrderRequest);

        expect(response.status).toBe(200);

        expect(response.body).toMatchObject({
          id: orderTestUtil.orderData.id,
          name: updateOrderRequest.name,
          phoneNumber: updateOrderRequest.phoneNumber,
          address: updateOrderRequest.address,
          usePoint: updateOrderRequest.usePoint,
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
            orderId: orderTestUtil.orderData.id,
          },
        });
      });
    });
    describe('DELETE /api/order/:id', () => {
      test('결제가 완료된 건에 대해 삭제를 진행하면 400을 반환한다', async()=>{
        await orderTestUtil.seedOrderTestData();
        const { agent } = await orderTestUtil.buyerUserLogin();
        const response = await agent.delete(`/api/order/${orderTestUtil.orderData.id}`);
        expect(response.status).toBe(400);
      })

      test('인증되지 않은 유저는 401을 반환한다', async () => {
        const response = await request(app).delete('/api/order/Id');
        expect(response.status).toBe(401);
      });

      test('접근 권한이 없는 유저는 403을 반환한다', async () => {
        const { agent } = await orderTestUtil.sellerUserLogin();
        const response = await agent
          .delete('/api/order/Id')
        expect(response.status).toBe(403);
      });

      test('orderId가 존재하지 않는다면 404를 반환한다', async () => {
        const { agent } = await orderTestUtil.buyerUserLogin();
        const response = await agent.delete(`/api/order/errorId`);

        expect(response.status).toBe(404);
      });
      test('결제 대기중인 주문 삭제에 성공하면 204를 반환한다', async () => {
        const orderData2 = {
          id: 'orderId2',
          userId: orderTestUtil.buyerUserData.id,
          name: '홍길동',
          phoneNumber: '010-1234-1234',
          address: '천안',
          subtotal: 45000,
          totalQuantity: 2,
          usePoint: 1000,
        };
        
         const orderItemData2 = {
          id: 'orderItemId2',
          price: 22500,
          quantity: 2,
          productId: orderTestUtil.productData.id,
          sizeId: orderTestUtil.sizeData.id,
          orderId: orderData2.id,
        };
        
         const paymentData2 = {
          id: 'paymentId2',
          price: 44000,
          status: PaymentStatus.WaitingPayment,
          orderId: orderData2.id,
        };

        await prismaClient.order.create({
          data: orderData2,
        });

        await prismaClient.orderItem.create({
          data: orderItemData2,
        });

        await prismaClient.payment.create({
          data: paymentData2,
        });

        const { agent } = await orderTestUtil.buyerUserLogin();
        const response = await agent.delete(`/api/order/${orderData2.id}`);

        expect(response.status).toBe(204);

      });
    });
  });
});
