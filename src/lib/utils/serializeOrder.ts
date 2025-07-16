import { OrderResponseDTO,OrderItemResponseDTO, OrderStocksResponseDTO } from "../../dto/orderDTO";

export function serializeOrder(order: OrderResponseDTO){
  return {
    id: order.id,
    name: order.name,
    phoneNumber: order.phoneNumber,
    address: order.address,
    subtotal: order.subtotal,
    totalQuantity: order.totalQuantity,
    usePoint: order.usePoint,
    createdAt: order.createdAt,
    orderItems: order.orderItems.map((orderItem: OrderItemResponseDTO)=>({
      id: orderItem.id,
      price: orderItem.price,
      quantity: orderItem.quantity,
      productId: orderItem.productId,
      product:{
        id: orderItem.product.id,
        storeId: orderItem.product.storeId,
        name: orderItem.product.name,
        price: orderItem.product.price,
        image: orderItem.product.image,
        discountRate: orderItem.product.discountRate,
        discountStartTime: orderItem.product.discountStartTime,
        discountEndTime: orderItem.product.discountEndTime,
        createdAt: orderItem.product.createdAt,
        updatedAt: orderItem.product.updatedAt,
        store: {
          id: orderItem.product.store.id,
          userId: orderItem.product.store.userId,
          name: orderItem.product.store.name,
          address: orderItem.product.store.address,
          phoneNumber: orderItem.product.store.phoneNumber,
          content: orderItem.product.store.content,
          image: orderItem.product.store.image,
          createdAt: orderItem.product.store.createdAt,
          updatedAt: orderItem.product.store.updatedAt,
        },
        stocks: orderItem.product.stocks.map((stock:OrderStocksResponseDTO)=>{
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
      isReviewed: orderItem.isReviewed,
    })),
    payments: order.payments,
  };
}

