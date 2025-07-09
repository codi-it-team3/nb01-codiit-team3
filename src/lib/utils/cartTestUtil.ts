import { GradeName, CategoryName, UserType } from '@prisma/client';
import { prismaClient } from '../prismaClient';
import app from '../../app';
import request from 'supertest';
import bcrypt from 'bcrypt';

export const gradeData = {
  id: 'grade_green',
  name: GradeName.Green,
  rate: 5,
  minAmount: 100000,
};

export const buyerUserData = {
  id: 'userId',
  name: '테스트Buyer',
  email: 'test@example.com',
  password: 'password',
  image: null,
  type: UserType.BUYER,
};

export const sellerUserData = {
  id: 'userId2',
  name: '테스트Seller',
  email: 'test2@example.com',
  password: 'password',
  image: null,
  type: UserType.SELLER,
};

export const storeData = {
  id: 'storeId',
  name: '너이키',
  userId: buyerUserData.id,
  address: '서울',
  phoneNumber: '123-1234',
  content: '스포츠 용품',
  image: 'imageURL',
};

export const categoryData = {
  id: 'categoryId',
  name: CategoryName.BOTTOM,
};

export const productData = {
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

export const sizeData = {
  id: 'sizeId',
  name: 'L',
  size: { en: 'L', ko: '라지' },
};

export const stockData = {
  id: 'stockId',
  productId: productData.id,
  sizeId: sizeData.id,
  quantity: 100,
};

export const cartData = {
  id: 'cartId',
  buyerId: buyerUserData.id,
};

export const cartItemData = {
  id: 'cartItemId',
  cartId: cartData.id,
  productId: productData.id,
  sizeId: sizeData.id,
  quantity: 2,
};

export const seedTestData = async () => {
  const hashedBuyerPassword = await bcrypt.hash(buyerUserData.password, 10);
  const hashedSellerPassword = await bcrypt.hash(sellerUserData.password, 10);

  await prismaClient.$transaction([
    prismaClient.grade.create({ data: gradeData }),
    prismaClient.user.create({ data: { ...buyerUserData, password: hashedBuyerPassword } }),
    prismaClient.user.create({ data: { ...sellerUserData, password: hashedSellerPassword } }),
    prismaClient.store.create({ data: storeData }),
    prismaClient.category.create({ data: categoryData }),
    prismaClient.product.create({ data: productData }),
    prismaClient.size.create({ data: sizeData }),
    prismaClient.stock.create({ data: stockData }),
  ]);
};

export const seedCartTestData = async () => {
  await prismaClient.$transaction([
    prismaClient.cart.create({ data: cartData }),
    prismaClient.cartItem.create({ data: cartItemData }),
  ]);
};

export const buyerUserLogin = async () => {
  const agent = request.agent(app);

  const res = await agent.post('/api/auth/login').send({
    email: buyerUserData.email,
    password: buyerUserData.password,
  });

  const token = res.body.accessToken;

  agent.set('Authorization', `Bearer ${token}`);

  return { agent };
};

export const sellerUserLogin = async () => {
  const agent = request.agent(app);

  const res = await agent.post('/api/auth/login').send({
    email: sellerUserData.email,
    password: sellerUserData.password,
  });

  const token = res.body.accessToken;

  agent.set('Authorization', `Bearer ${token}`);

  return { agent };
};