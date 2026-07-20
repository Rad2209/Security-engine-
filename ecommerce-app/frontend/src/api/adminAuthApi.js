import axiosInstance from './axiosInstance';

/**
 * Deliberately a separate module from authApi.js, mirroring the backend's
 * separation of adminAuthController from authController — no shared code
 * path between customer and admin auth, on either side of the stack.
 *
 * On success, sets the httpOnly "adminToken" cookie — a different cookie
 * name from the customer's "token", so both sessions can coexist in the
 * same browser without colliding.
 */

/**
 * @param {{ email: string, password: string }} input
 * @returns {Promise<{ id: string, name: string, email: string }>}
 */
export async function adminLogin({ email, password }) {
  const envelope = await axiosInstance.post('/admin/login', { email, password });
  return envelope.data;
}

/** Clears the httpOnly "adminToken" cookie server-side. */
export async function adminLogout() {
  const envelope = await axiosInstance.post('/admin/logout');
  return envelope.data;
}
/**
 * Same purpose as authApi.getMe(), for the admin session.
 * @returns {Promise<{ id: string, name: string, email: string }>}
 */
export async function getAdminMe() {
  const envelope = await axiosInstance.get('/admin/me');
  return envelope.data;
}