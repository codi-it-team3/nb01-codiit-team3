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
}

export interface CreateProductDto {
  name: string;
  price: number;
  storeId: string;
  categoryId: string;
  image: string;
  discountRate?: number;
  discountStartTime?: string;
  discountEndTime?: string;
  stocks: StockInput[];
}

export interface UpdateProductDto {
  name?: string;
  price?: number;
  categoryId?: string;
  discountRate?: number;
  discountStartTime?: string;
  discountEndTime?: string;
  tags?: string[];
  images?: string[];
}
