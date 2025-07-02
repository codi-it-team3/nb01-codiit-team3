import {
  CartResponseDTO,
  CartItemResponseDTO,
  CartItemWithCartResponseDTO,
  StocksResponseDTO,
} from '../../dto/cartDTO';

export function mapToGetCartDTO(cart: CartResponseDTO) {
  return {
    id: cart.id,
    buyerId: cart.buyerId,
    createdAt: cart.createdAt,
    updatedAt: cart.updatedAt,
    items: cart.items.map((item: CartItemResponseDTO) => ({
      id: item.id,
      cartId: item.cartId,
      productId: item.productId,
      sizeId: item.sizeId,
      quantity: item.quantity,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      product: {
        id: item.product.id,
        storeId: item.product.storeId,
        name: item.product.name,
        price: item.product.price,
        image: item.product.image,
        discountRate: item.product.discountRate,
        discountStartTime: item.product.discountStartTime ?? null,
        discountEndTime: item.product.discountEndTime ?? null,
        createdAt: item.product.createdAt,
        updatedAt: item.product.updatedAt,
        store: {
          id: item.product.store.id,
          userId: item.product.store.userId,
          name: item.product.store.name,
          address: item.product.store.address,
          phoneNumber: item.product.store.phoneNumber,
          content: item.product.store.content,
          image: item.product.store.image,
          createdAt: item.product.store.createdAt,
          updatedAt: item.product.store.updatedAt,
        },
        stocks: item.product.stocks.map((stock: StocksResponseDTO) => {
          const sizeValue = stock.size.size;
          const isSizeObj =
            typeof sizeValue === 'object' && sizeValue !== null && !Array.isArray(sizeValue);

          return {
            id: stock.id,
            productId: stock.productId,
            sizeId: stock.sizeId,
            quantity: stock.quantity,
            size: {
              id: stock.size.id,
              size: {
                en: isSizeObj ? (sizeValue.en ?? '') : '',
                ko: isSizeObj ? (sizeValue.ko ?? '') : '',
              },
            },
          };
        }),
      },
    })),
  };
}

export function mapToGetCartItemDTO(cartItem: CartItemWithCartResponseDTO) {
  return {
    id: cartItem.id,
    cartId: cartItem.cartId,
    productId: cartItem.productId,
    sizeId: cartItem.sizeId,
    quantity: cartItem.quantity,
    createdAt: cartItem.createdAt,
    updatedAt: cartItem.updatedAt,
    product: {
      id: cartItem.product.id,
      storeId: cartItem.product.storeId,
      name: cartItem.product.name,
      price: cartItem.product.price,
      image: cartItem.product.image,
      discountRate: cartItem.product.discountRate,
      discountStartTime: cartItem.product.discountStartTime,
      discountEndTime: cartItem.product.discountEndTime,
      createdAt: cartItem.product.createdAt,
      updatedAt: cartItem.product.updatedAt,
      store: {
        id: cartItem.product.store.id,
        userId: cartItem.product.store.userId,
        name: cartItem.product.store.name,
        address: cartItem.product.store.address,
        phoneNumber: cartItem.product.store.phoneNumber,
        content: cartItem.product.store.content,
        image: cartItem.product.store.image,
        createdAt: cartItem.product.store.createdAt,
        updatedAt: cartItem.product.store.updatedAt,
      },
      stocks: cartItem.product.stocks.map((stock: StocksResponseDTO) => {
        const sizeValue = stock.size.size;
        const isSizeObj =
          typeof sizeValue === 'object' && sizeValue !== null && !Array.isArray(sizeValue);

        return {
          id: stock.id,
          productId: stock.productId,
          sizeId: stock.sizeId,
          quantity: stock.quantity,
          size: {
            id: stock.size.id,
            size: {
              en: isSizeObj ? (sizeValue.en ?? '') : '',
              ko: isSizeObj ? (sizeValue.ko ?? '') : '',
            },
          },
        };
      }),
    },
    cart: {
      id: cartItem.cart.id,
      buyerId: cartItem.cart.buyerId,
      createdAt: cartItem.cart.createdAt,
      updatedAt: cartItem.cart.updatedAt,
    },
  };
}
