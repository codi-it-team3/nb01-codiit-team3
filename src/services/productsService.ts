import { CreateProductInput, UpdateProductInput, ProductQuery } from '../types/product';
import NotFoundError from '../lib/errors/ProductNotFoundError';
import UnauthorizedError from '../lib/errors/UnauthorizedError';
import {
  findStoreById,
  findCategoryById,
  findSizeById,
  findProductById,
  deleteProductById,
  getFavoriteStoreIds,
  createProductInDB,
  getFilteredProductListAndCount,
  getProductDetailById,
  runUpdateProductTx,
  getLatestProductView,
  getProductListByCategoryExceptOne,
  getPopularProductList,
} from '../repositories/productsRepository';
import { buildProductWhereQuery, buildProductOrderByQuery } from '../lib/utils/productQueryUtil';
import { mapProductListWithStats } from '../lib/utils/productMapperUtil';
import { getDiscountPrice, getReviewsStats } from '../lib/utils/productStatsUtil';
import { mapUpdateProductData } from '../lib/utils/productMapperUtil';

export async function createProduct(data: CreateProductInput, userId: string) {
  const store = await findStoreById(data.storeId);
  if (!store) throw new NotFoundError('store', data.storeId);

  if (store.userId !== userId) {
    throw new UnauthorizedError('해당 스토어에 상품을 등록할 권한이 없습니다.');
  }

  const category = await findCategoryById(data.categoryId);
  if (!category) throw new NotFoundError('category', data.categoryId);

  for (const stock of data.stocks) {
    const size = await findSizeById(stock.sizeId);
    if (!size) throw new NotFoundError('size', stock.sizeId);
  }

  const created = await createProductInDB({
    name: data.name,
    price: data.price,
    image: data.image,
    content: data.content,
    discountRate: data.discountRate ?? 0,
    discountStartTime: data.discountStartTime ? new Date(data.discountStartTime) : undefined,
    discountEndTime: data.discountEndTime ? new Date(data.discountEndTime) : undefined,
    store: { connect: { id: data.storeId } },
    category: { connect: { id: data.categoryId } },
    stocks: {
      createMany: {
        data: data.stocks.map((stock) => ({
          sizeId: stock.sizeId,
          quantity: stock.quantity,
        })),
      },
    },
  });

  return getProductDetailById(created.id);
}

export async function getProductList(params: ProductQuery, userId?: string) {
  const { sort = 'recent', limit = '10', favoriteOnly } = params;

  const page = String(params.page ?? '1');
  const take = parseInt(limit, 10);
  const skip = (parseInt(page, 10) - 1) * take;

  let favoriteStoreIds: string[] = [];
  if (favoriteOnly === 'true' && userId) {
    favoriteStoreIds = await getFavoriteStoreIds(userId);
  }

  const where = buildProductWhereQuery(params, favoriteStoreIds);
  const orderBy = buildProductOrderByQuery(sort);

  const [list, total] = await getFilteredProductListAndCount({
    where,
    orderBy,
    skip,
    take,
  });

  const totalPages = Math.ceil(total / take);
  const processedList = mapProductListWithStats(list);

  return {
    list: processedList,
    total,
    page: parseInt(page, 10),
    limit: take,
    totalPages,
  };
}

export async function getProductDetail(id: string) {
  const product = await getProductDetailById(id);
  if (!product) return null;

  const discountPrice = getDiscountPrice(product.price, product.discountRate);

  const {
    count: reviewsCount,
    rating: reviewsRating,
    counts: rateCounts,
    sum: sumScore,
  } = getReviewsStats(product.reviews);

  return {
    id: product.id,
    name: product.name,
    image: product.image,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    price: product.price,
    content: product.content,
    discountRate: product.discountRate,
    discountStartTime: product.discountStartTime,
    discountEndTime: product.discountEndTime,
    discountPrice,
    storeId: product.storeId,
    storeName: product.store.name,
    category: [{ id: product.category.id, name: product.category.name }],
    stocks: product.stocks.map((stock) => ({
      id: stock.id,
      productId: stock.productId,
      sizeId: stock.sizeId,
      quantity: stock.quantity,
      size: stock.size,
    })),
    reviewsCount,
    reviewsRating,
    reviews: [
      {
        rate1Length: rateCounts[0],
        rate2Length: rateCounts[1],
        rate3Length: rateCounts[2],
        rate4Length: rateCounts[3],
        rate5Length: rateCounts[4],
      },
      sumScore,
    ],
    inquiries: product.inquiries.map((inq) => ({
      id: inq.id,
      title: inq.title,
      content: inq.content,
      status: inq.status,
      isSecret: inq.isSecret,
      createdAt: inq.createdAt,
      updatedAt: inq.updatedAt,
      reply: inq.reply
        ? {
            id: inq.reply.id,
            content: inq.reply.content,
            createdAt: inq.reply.createdAt,
            updatedAt: inq.reply.updatedAt,
            user: inq.reply.user,
          }
        : null,
    })),
  };
}

export async function updateProduct(id: string, data: UpdateProductInput, userId: string) {
  const existing = await findProductById(id);
  if (!existing) throw new NotFoundError('product', id);

  if (existing.store?.userId !== userId) {
    throw new UnauthorizedError('해당 상품을 수정할 권한이 없습니다.');
  }

  if (data.categoryId) {
    const category = await findCategoryById(data.categoryId);
    if (!category) throw new NotFoundError('category', data.categoryId);
  }

  if (data.stocks) {
    for (const stock of data.stocks) {
      const size = await findSizeById(stock.sizeId);
      if (!size) throw new NotFoundError('size', stock.sizeId);
    }
  }

  const updateData = mapUpdateProductData(data);
  return runUpdateProductTx(id, updateData, data.stocks);
}

export async function deleteProduct(id: string, userId: string) {
  const product = await findProductById(id);
  if (!product) throw new NotFoundError('product', id);

  if (product.store?.userId !== userId) {
    throw new UnauthorizedError('해당 상품을 삭제할 권한이 없습니다.');
  }

  await deleteProductById(id);
}

export async function getRecommendedProducts(userId: string) {
  const latestView = await getLatestProductView(userId);

  if (!latestView || !latestView.product) {
    return await getPopularProductList(4);
  }

  const { id: lastProductId, categoryId } = latestView.product;

  const recommendedProducts = await getProductListByCategoryExceptOne(categoryId, lastProductId, 4);

  return recommendedProducts;
}

export async function getPopularProducts(limit = 4) {
  return await getPopularProductList(limit);
}
