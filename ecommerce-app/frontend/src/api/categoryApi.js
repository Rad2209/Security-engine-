import axiosInstance from './axiosInstance';

/**
 * Public — used for the category filter bar on product browsing.
 * @returns {Promise<Array<{ _id: string, name: string, slug: string, description: string }>>}
 */
export async function listCategories() {
  const envelope = await axiosInstance.get('/categories');
  return envelope.data;
}