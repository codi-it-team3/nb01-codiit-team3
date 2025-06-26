import express from 'express';
import { prismaClient } from '../lib/prismaClient';

const cartRouter = express.Router();

cartRouter.post('/', async (req, res) => {
  const { id, buyerId } = req.body;

  const cart = await prismaClient.cart.create({
    data: { id, buyerId },
  });

  res.status(201).json(cart);
});

cartRouter.get('/', async (req, res): Promise<void> => {
  const { buyerId } = req.query;

  const cart = await prismaClient.cart.findFirst({
    where: { buyerId: String(buyerId) },
    include: {
      items: {
        include: {
          product: {
            include: {
              store: true,
              stocks: {
                include: { size: true },
              },
            },
          },
        },
      },
    },
  });

  if (!cart) {
    res.status(404).json({ error: 'Cart not found' });
    return;
  }

  res.status(200).json(cart);
});

cartRouter.patch('/', async (req, res): Promise<void> => {
  const { buyerId } = req.query;
  const { productId, sizes } = req.body;

  if (!Array.isArray(sizes) || sizes.length === 0) {
    res.status(400).json({ error: 'Sizes must be provided' });
    return;
  }

  const cart = await prismaClient.cart.findFirst({ where: { buyerId: String(buyerId) } });
  if (!cart) {
    res.status(404).json({ error: 'Cart not found' });
    return;
  }

  const updatedItems = [];

  for (const size of sizes) {
    const existingItem = await prismaClient.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        sizeId: size.sizeId,
      },
    });

    if (existingItem) {
      const updated = await prismaClient.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: size.quantity },
        include: {
          product: {
            include: {
              store: true,
              stocks: { include: { size: true } },
            },
          },
          cart: true,
        },
      });
      updatedItems.push(updated);
    } else {
      const created = await prismaClient.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          sizeId: size.sizeId,
          quantity: size.quantity,
        },
        include: {
          product: {
            include: {
              store: true,
              stocks: { include: { size: true } },
            },
          },
          cart: true,
        },
      });
      updatedItems.push(created);
    }
  }

  res.status(200).json(updatedItems); 
});

cartRouter.get('/:id', async (req, res): Promise<void> => {
  const { id } = req.params;

  const item = await prismaClient.cartItem.findUnique({
    where: { id },
    include: {
      product: {
        include: {
          store: true,
          stocks: { include: { size: true } },
        },
      },
      cart: true,
    },
  });

  if (!item) {
    res.status(404).json({ error: 'Cart item not found' });
    return;
  }

  res.status(200).json(item);
});

cartRouter.delete('/:id', async (req, res): Promise<void> => {
  const { id } = req.params;

  const existingItem = await prismaClient.cartItem.findUnique({ where: { id } });
  if (!existingItem) {
    res.status(404).json({ error: 'Cart item not found' });
    return;
  }

  await prismaClient.cartItem.delete({ where: { id } });

  res.status(204).send();
});

export default cartRouter;
