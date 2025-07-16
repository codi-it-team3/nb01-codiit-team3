import { PaymentStatus } from '@prisma/client';

export interface OrderRequestDTO {
  userId: string;
  name: string;
  phoneNumber: string;
  address: string;
  orderItems: OrderItemRequestDTO[];
  usePoint: number;
}

export interface OrderItemRequestDTO {
  productId: string;
  sizeId: string;
  quantity: number;
}

export interface OrderUpdateRequestDTO {
  name: string;
  phoneNumber: string;
  address: string;
  orderItems: OrderItemUpdateRequestDTO[];
  usePoint: number;
}

export interface OrderItemUpdateRequestDTO extends OrderItemRequestDTO {
  price: number;
}

export interface OrderResponseDTO {
  id: string;
  name: string;
  phoneNumber: string;
  address: string;
  subtotal: number;
  totalQuantity: number;
  usePoint: number;
  createdAt: Date;
  orderItems: OrderItemResponseDTO[];
  payments: PaymentsResponseDTO | null;
}

export interface OrderItemResponseDTO {
  id: string;
  price: number;
  quantity: number;
  productId: string;
  product: OrderProductResponseDTO;
  size: OrderSizeResponseDTO;
  isReviewed: boolean;
}

export interface OrderProductResponseDTO {
  id: string;
  storeId: string;
  name: string;
  price: number;
  image: string;
  discountRate: number;
  discountStartTime: Date | null;
  discountEndTime: Date | null;
  createdAt: Date;
  updatedAt: Date;
  store: OrderStoreResponseDTO;
  stocks: OrderStocksResponseDTO[];
}

export interface OrderStoreResponseDTO {
  id: string;
  userId: string;
  name: string;
  address: string;
  phoneNumber: string;
  content: string;
  image: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderStocksResponseDTO {
  id: string;
  productId: string;
  sizeId: string;
  quantity: number;
  size: OrderSizeResponseDTO;
}

export interface OrderSizeResponseDTO {
  id: string;
  size: string | number | boolean | { en?: string; ko?: string } | null | Array<any>;
}

export interface PaymentsResponseDTO {
  id: string;
  price: number;
  status: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
  orderId: string;
}
