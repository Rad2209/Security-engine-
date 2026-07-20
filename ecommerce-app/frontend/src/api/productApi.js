import axiosInstance from './axiosInstance';

/**
 * Public — no auth required. Mirrors productRoutes.js's GET / and GET /:id.
 *
 * @param {{ search?: string, category?: string, page?: number, limit?: number }} [filters]
 * @returns {Promise<{ items: Array<object>, pagination: { page: number, limit: number, total: number, totalPages: number } }>}
 */
export async function listProducts(filters = {}) {
  const envelope = await axiosInstance.get('/products', { params: filters });
  return envelope.data;
}

/**
 * @param {string} id
 * @returns {Promise<object>} the product, with categoryId populated
 */
export async function getProduct(id) {
  const envelope = await axiosInstance.get(`/products/${id}`);
  return envelope.data;
}