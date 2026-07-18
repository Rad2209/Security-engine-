const { validationResult } = require('express-validator');

/**
 * handleValidation
 *
 * Shared middleware used after any express-validator chain (auth, product,
 * review). Centralized so the 422 response shape is defined in exactly one
 * place. Originally lived duplicated inside authValidators.js; extracted
 * here once product/review validators needed the identical logic.
 */
function handleValidation(req, res, next) {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    return res.status(422).json({
      success: false,
      error: { message: 'Validation failed', details: result.array() },
    });
  }

  return next();
}

module.exports = handleValidation;