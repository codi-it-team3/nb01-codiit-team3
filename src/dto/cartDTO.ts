export interface CartResponseDTO {
  id: string;
  buyerId: string;
  createdAt: Date;
  updatedAt: Date;
  items: CartItemResponseDTO[];
}

export interface CartItemWithCartDTO {
  id: string;
  buyerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItemResponseDTO {
  id: string;
  cartId: string;
  productId: string;
  sizeId: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
  product: ProductResponseDTO;
}

export interface CartItemWithCartResponseDTO {
  id: string;
  cartId: string;
  productId: string;
  sizeId: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
  product: ProductResponseDTO;
  cart: CartItemWithCartDTO;
}

export interface ProductResponseDTO {
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
  store: StoreResponseDTO;
  stocks: StocksResponseDTO[];
}

export interface StoreResponseDTO {
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

export interface StocksResponseDTO {
  id: string;
  productId: string;
  sizeId: string;
  quantity: number;
  size: SizeResponseDTO;
}

export interface SizeResponseDTO {
  id: string;
  size: string | number | boolean | { en?: string; ko?: string } | null | Array<any>;
}

export interface UpdateCartItemRequestDTO {
  cartId: string;
  productId: string;
  sizeId: string;
  quantity: number;
}
