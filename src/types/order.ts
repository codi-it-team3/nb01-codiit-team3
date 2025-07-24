import { Prisma, PaymentStatus } from '@prisma/client';

export type CreateOrder = {
  userId: string;
  name: string;
  phoneNumber: string;
  address: string;
  usePoint: number;
  orderItems: {
    productId: string;
    sizeId: string;
    quantity: number;
  }[];
};

export type CreateOrderWithExtras = CreateOrder & {
  subtotal: number;
  totalQuantity: number;
  priceMap: Record<string, number>;
};

export type OrderList = Prisma.OrderGetPayload<{
  include: {
    orderItems: {
      include: {
        product: {
          include: {
            store: true;
            stocks: {
              include: {
                size: true;
              };
            };
          };
        };
        size: true;
      };
    };
    payments: true;
  };
}>;

export type PaginationParams = {
  page: number;
  pageSize: number;
  orderBy?: 'recent' | 'oldest';
  status?: PaymentStatus;
};

export type PaginatedOrderList = {
  data: OrderList[];
  meta: {
    limit: number;
    page: number;
    total: number;
    totalPages: number;
  };
};

export type UpdateOrderData = {
  name: string;
  phoneNumber: string;
  address: string;
  orderItems: {
    productId: string;
    sizeId: string;
    quantity: number;
    price: number;
  }[];
  usePoint: number;
};

export type SalesLogs = {
  productId: string;
  storeId: string;
  userId: string;
  price: number;
  quantity: number;
  soldAt: Date;
}[];
