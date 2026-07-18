const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { error } = require('../utils/apiResponse');

/**
 * authMiddleware
 *
 * Reads the JWT from the httpOnly cookie (never from an Authorization
 * header — the frontend never has direct access to the token to put one
 * there) and verifies it. On success, attaches a minimal `req.user` object
 * for downstream controllers.
 */
function authMiddleware(req, res, next) {
  const token = req.cookies && req.cookies.token;

  if (!token) {
    return error(res, 'Authentication required', 401);
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    req.user = { id: payload.sub, role: payload.role };
    return next();
  } catch (err) {
    return error(res, 'Invalid or expired session', 401);
  }
}

module.exports = authMiddleware;