import axiosInstance from './axiosInstance';

/**
 * Every function here requires a logged-in customer — cartRoutes.js applies
 * authMiddleware to the whole router. The httpOnly cookie is sent
 * automatically via withCredentials, so no token handling is needed here;
 * a 401 response (handled by the calling page) means the session expired
 * or was never established.
 */

/** @returns {Promise<object>} the current user's cart, with items.productId populated */
export async function getCart() {
  const envelope = await axiosInstance.get('/cart');
  return envelope.data;
}

/**
 * @param {{ productId: string, quantity: number }} input
 * @returns {Promise<object>} the updated cart
 */
export async function addCartItem({ productId, quantity }) {
  const envelope = await axiosInstance.post('/cart', { productId, quantity });
  return envelope.data;
}

/**
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<object>} the updated cart
 */
export async function updateCartItem(productId, quantity) {
  const envelope = await axiosInstance.put(`/cart/${productId}`, { quantity });
  return envelope.data;
}

/**
 * @param {string} productId
 * @returns {Promise<object>} the updated cart
 */
export async function removeCartItem(productId) {
  const envelope = await axiosInstance.delete(`/cart/${productId}`);
  return envelope.data;
}

/** @returns {Promise<object>} the now-empty cart */
export async function clearCart() {
  const envelope = await axiosInstance.delete('/cart');
  return envelope.data;
}