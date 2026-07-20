import axiosInstance from './axiosInstance';

/**
 * Every function here requires a verified admin session (the "adminToken"
 * cookie) — adminRoutes.js applies adminAuthMiddleware to all of these.
 * A 401 means no/invalid admin session; a 403 would mean a valid session
 * that isn't role: 'admin' (defense in depth on the backend, shouldn't
 * normally occur from this frontend's own admin login flow).
 */

/** @returns {Promise<Array<object>>} all customer accounts, passwordHash excluded */
export async function listUsers() {
  const envelope = await axiosInstance.get('/admin/users');
  return envelope.data;
}

/** @returns {Promise<Array<object>>} every product, unpaginated (admin "view all" screen) */
export async function listAllProducts() {
  const envelope = await axiosInstance.get('/admin/products');
  return envelope.data;
}

/**
 * @param {{ type?: 'SQL_INJECTION'|'XSS'|'BRUTE_FORCE', ip?: string, from?: string, to?: string, limit?: number }} [filters]
 * @returns {Promise<Array<object>>} attack log entries, newest first
 */
export async function listLogs(filters = {}) {
  const envelope = await axiosInstance.get('/admin/logs', { params: filters });
  return envelope.data;
}

/** @returns {Promise<Array<{ ip: string, reason: string, blockedAt: string, expiresAt: string }>>} */
export async function listBlockedIps() {
  const envelope = await axiosInstance.get('/admin/blocked-ips');
  return envelope.data;
}

/**
 * @param {string} ip
 * @returns {Promise<{ message: string }>}
 */
export async function unblockIp(ip) {
  const envelope = await axiosInstance.patch(`/admin/blocked-ips/${encodeURIComponent(ip)}/unblock`);
  return envelope.data;
}

/**
 * @returns {Promise<{ totalAttacks: number, byType: object, activeBlockedIps: number, activeBlockedAccounts: number }>}
 */
export async function getStats() {
  const envelope = await axiosInstance.get('/admin/stats');
  return envelope.data;
}