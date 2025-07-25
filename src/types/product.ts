import { Product, Stock, Size, Category, Store, Prisma } from '@prisma/client';

export interface StockInput {
  sizeId: string;
  quantity: number;
}

export interface ProductQuery {
  name?: string;
  categoryId?: string;
  storeId?: string;
  sizeId?: string;
  sort?: string;
  page?: string;
  limit?: string;
  storeName?: string;
  minPrice?: string;
  maxPrice?: string;
  favoriteOnly?: string;
}

export interface CreateProductInput {
  name: string;
  price: number;
  storeId: string;
  categoryId: string;
  content?: string;
  image: string;
  discountRate?: number;
  discountStartTime?: string;
  discountEndTime?: string;
  stocks: {
    sizeId: string;
    quantity: number;
  }[];
}

export interface UpdateProductInput {
  name?: string;
  price?: number;
  categoryId?: string;
  content?: string;
  discountRate?: number;
  discountStartTime?: string;
  discountEndTime?: string;
  image?: string;

  stocks?: {
    sizeId: string;
    quantity: number;
  }[];
}

export type ProductListItem = Product & {
  stocks: (Stock & { size: Size })[];
  category: Category;
  store: Store;
  SalesLog: { quantity: number }[];
  _count: { reviews: number };
};
