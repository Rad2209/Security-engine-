/**
 * errorHandler.js
 *
 * Global Express error-handling middleware — must be registered last, after
 * all routes. Catches:
 *   - Errors thrown/passed via next(err) from controllers/services
 *   - Internal SecurityEngine errors (the engine calls next(err) rather
 *     than next() when it hits an unexpected internal failure, per its
 *     fail-closed design — see security-engine/src/core/SecurityEngine.js)
 *
 * Never leaks stack traces or internal error details to the client in
 * production; logs them server-side instead.
 */
const env = require('../config/env');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error(err);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    error: {
      message: statusCode === 500 ? 'Internal server error' : err.message,
      ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
}

module.exports = errorHandler;