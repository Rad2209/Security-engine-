import axiosInstance from './axiosInstance';

/**
 * Public — anyone can read reviews. Mirrors productRoutes.js's GET /:id/reviews.
 * @param {string} productId
 * @returns {Promise<Array<object>>}
 */
export async function listReviews(productId) {
  const envelope = await axiosInstance.get(`/products/${productId}/reviews`);
  return envelope.data;
}

/**
 * Requires a logged-in customer (the httpOnly cookie is sent automatically
 * via withCredentials — nothing extra to do here). userId is derived
 * server-side from the verified token, never sent from the client — see
 * reviewController.js's createReviewHandler comment on why.
 *
 * @param {string} productId
 * @param {{ rating: number, comment: string }} input
 * @returns {Promise<object>} the created review
 */
export async function createReview(productId, { rating, comment }) {
  const envelope = await axiosInstance.post(`/products/${productId}/reviews`, { rating, comment });
  return envelope.data;
}