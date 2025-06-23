import { Router } from 'express';
import { prismaClient } from '../lib/prismaClient';
import { PaymentStatus } from '@prisma/client';

const orderRouter = Router();

orderRouter.post('/', async (req, res):Promise<void> => {
    const data = req.body;

    const order = await prismaClient.order.create({
      data: {
        userId: data.userId,
        name: data.name,
        phoneNumber: data.phoneNumber,
        address: data.address,
        subtotal: data.subtotal,
        totalQuantity: data.totalQuantity,
        usePoint: data.usePoint,
      },
    });

    if (Array.isArray(data.orderItems) && data.orderItems.length > 0) {
      const orderItemsData = data.orderItems.map((item:any) => ({
        price: item.price,
        quantity: item.quantity,
        productId: item.productId,
        sizeId: item.sizeId,
        orderId: order.id,
      }));
      await prismaClient.orderItem.createMany({
        data: orderItemsData,
      });
    }

    await prismaClient.payment.create({
      data: {
        price: order.subtotal - order.usePoint,
        status: PaymentStatus.CompletedPayment,
        orderId: order.id,
      },
    });

    const fullOrder = await prismaClient.order.findUnique({
      where: { id: order.id },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                store: true,
                stocks: {
                  include: {
                    size: true,
                  },
                },
              },
            },
            size: true,
          },
        },
        payments: true,
      },
    });

    res.status(201).json(fullOrder);
});

orderRouter.get('/', async (req, res):Promise<void> => {
    const orders = await prismaClient.order.findMany({
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                store: true,
                stocks: {
                  include: {
                    size: true,
                  },
                },
              },
            },
            size: true,
          },
        },
        payments: true,
      },
    });

    res.status(200).json(orders);
});

orderRouter.get('/:id', async (req, res):Promise<void> => {
    const { id } = req.params;

    const order = await prismaClient.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                store: true,
                stocks: {
                  include: {
                    size: true,
                  },
                },
              },
            },
            size: true,
          },
        },
        payments: true,
      },
    });

    if (!order) {
     res.status(404).json({ error: 'Order not found' });
     return;
    }

    res.status(200).json(order);
});

orderRouter.patch('/:id', async (req, res):Promise<void> => {
  try {
    const { id } = req.params;
    const { name, phoneNumber, address, usePoint } = req.body;

    const orderExists = await prismaClient.order.findUnique({ where: { id } });
    if (!orderExists) {
     res.status(404).json({ error: 'Order not found' });
     return;
    }

    const updatedOrder = await prismaClient.order.update({
      where: { id },
      data: {
        name,
        phoneNumber,
        address,
        usePoint: Number(usePoint),
      },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                store: true,
                stocks: {
                  include: {
                    size: true,
                  },
                },
              },
            },
            size: true,
          },
        },
        payments: true,
      },
    });

    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '주문 수정 중 오류가 발생했습니다.' });
  }
});

orderRouter.delete('/:id', async (req, res):Promise<void> => {
  try {
    const { id } = req.params;

    const orderExists = await prismaClient.order.findUnique({ where: { id } });
    if (!orderExists) {
     res.status(404).json({ error: 'Order not found' });
     return;
    }

    await prismaClient.order.delete({ where: { id } });

    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '주문 삭제 중 오류가 발생했습니다.' });
  }
});

export default orderRouter;
