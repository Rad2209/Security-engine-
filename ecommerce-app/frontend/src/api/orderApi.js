import axiosInstance from './axiosInstance';

/**
 * Requires a logged-in customer. checkout() takes no arguments — it always
 * converts the CURRENT cart (server-side) into an order; there's nothing
 * for the client to pass, which also means there's nothing for a client to
 * tamper with (no client-supplied prices or item lists reach the server —
 * see orderService.checkout()'s server-side price snapshotting).
 */

/** @returns {Promise<object>} the newly created order */
export async function checkout() {
  const envelope = await axiosInstance.post('/orders');
  return envelope.data;
}

/** @returns {Promise<Array<object>>} the current user's past orders, newest first */
export async function listOrders() {
  const envelope = await axiosInstance.get('/orders');
  return envelope.data;
}