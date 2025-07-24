export function getDiscountPrice(price: number, discountRate?: number | null) {
  return discountRate ? Math.floor(price * (1 - discountRate / 100)) : price;
}

export function getReviewsStats(reviews: { rating: number }[]) {
  const count = reviews.length;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  const rating = count > 0 ? Number((sum / count).toFixed(1)) : 0;
  const counts = [1, 2, 3, 4, 5].map((rate) => reviews.filter((r) => r.rating === rate).length);
  return { count, rating, counts, sum };
}
