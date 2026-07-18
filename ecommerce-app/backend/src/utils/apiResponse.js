/**
 * apiResponse.js
 *
 * Small helpers to keep every successful API response in the same shape:
 * { success: true, data: ... }
 * Error responses (blocked requests, thrown errors) are shaped by
 * ResponseHandler (inside the engine) and errorHandler.js respectively —
 * both use the same { success: false, error: {...} } envelope, so the
 * frontend only ever needs to check `response.data.success` once.
 */
function success(res, data, statusCode = 200) {
  return res.status(statusCode).json({ success: true, data });
}

function error(res, message, statusCode = 400) {
  return res.status(statusCode).json({ success: false, error: { message } });
}

module.exports = { success, error };