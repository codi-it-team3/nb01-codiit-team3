interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  orderItemId: string;
}

export default Review;
