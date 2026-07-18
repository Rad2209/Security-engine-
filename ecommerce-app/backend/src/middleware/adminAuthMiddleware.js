const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { error } = require('../utils/apiResponse');

/**
 * adminAuthMiddleware
 *
 * Reads the separate `adminToken` cookie (never `token`, the customer
 * cookie) and verifies both the JWT signature AND that the payload's role
 * is 'admin'. The role check matters even though only admin login ever
 * signs a token with role: 'admin' — defense in depth against any future
 * code path that might sign a token incorrectly.
 */
function adminAuthMiddleware(req, res, next) {
  const token = req.cookies && req.cookies.adminToken;

  if (!token) {
    return error(res, 'Admin authentication required', 401);
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);

    if (payload.role !== 'admin') {
      return error(res, 'Admin privileges required', 403);
    }

    req.admin = { id: payload.sub, role: payload.role };
    return next();
  } catch (err) {
    return error(res, 'Invalid or expired session', 401);
  }
}

module.exports = adminAuthMiddleware;