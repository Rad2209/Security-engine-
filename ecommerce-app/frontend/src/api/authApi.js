import axiosInstance from './axiosInstance';

/**
 * @param {{ name: string, email: string, password: string }} input
 * @returns {Promise<{ id: string, name: string, email: string }>}
 */
export async function register({ name, email, password }) {
  const envelope = await axiosInstance.post('/auth/register', { name, email, password });
  return envelope.data;
}

/**
 * On success, the backend sets the httpOnly "token" cookie automatically —
 * there's no token to store in JS here, and there shouldn't be (see Phase 1
 * §9 on why the cookie is httpOnly).
 * @param {{ email: string, password: string }} input
 * @returns {Promise<{ id: string, name: string, email: string }>}
 */
export async function login({ email, password }) {
  const envelope = await axiosInstance.post('/auth/login', { email, password });
  return envelope.data;
}

/** Clears the httpOnly "token" cookie server-side. */
export async function logout() {
  const envelope = await axiosInstance.post('/auth/logout');
  return envelope.data;
}
/**
 * The ONLY way to check "is there a valid session?" on page load/refresh —
 * the JWT lives in an httpOnly cookie, so JavaScript can't read it directly.
 * A 401 here means no session / expired session; the caller (AuthContext)
 * treats that as logged-out rather than as an error to surface to the user.
 * @returns {Promise<{ id: string, name: string, email: string }>}
 */
export async function getMe() {
  const envelope = await axiosInstance.get('/auth/me');
  return envelope.data;
}