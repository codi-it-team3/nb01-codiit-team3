import Review from '../types/Review';

const reviewResponseDTO = (review: Review) => {
  const { updatedAt, orderItemId, ...reviewWithoutMeta } = review;
  return reviewWithoutMeta;
};

export default reviewResponseDTO;
