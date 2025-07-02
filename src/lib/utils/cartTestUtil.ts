import { GradeName, CategoryName } from '@prisma/client';
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

export const userData = {
  id: 'userId',
  name: '테스트Buyer',
  email: 'test@example.com',
  password: 'password',
  image: null,
};

export const storeData = {
  id: 'storeId',
  name: '너이키',
  userId: userData.id,
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
  buyerId: userData.id,
};

export const cartItemData = {
  id: 'cartItemId',
  cartId: cartData.id,
  productId: productData.id,
  sizeId: sizeData.id,
  quantity: 2,
};

export const seedTestData = async () => {
  const hashedPassword = await bcrypt.hash(userData.password, 10);

  await prismaClient.grade.create({ data: gradeData });
  await prismaClient.user.create({
    data: { ...userData, password: hashedPassword },
  });
  await prismaClient.store.create({ data: storeData });
  await prismaClient.category.create({ data: categoryData });
  await prismaClient.product.create({ data: productData });
  await prismaClient.size.create({ data: sizeData });
  await prismaClient.stock.create({ data: stockData });
};

export const seedCartTestData = async () => {
  await prismaClient.cart.create({ data: cartData });
  await prismaClient.cartItem.create({ data: cartItemData });
};

export const registerAndLogin = async () => {
  const agent = request.agent(app);

  const res = await agent.post('/api/auth/login').send({
    email: userData.email,
    password: userData.password,
  });

  const token = res.body.accessToken;

  agent.set('Authorization', `Bearer ${token}`);

  return { agent };
};
