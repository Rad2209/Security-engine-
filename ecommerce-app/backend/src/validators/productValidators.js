const { query, param } = require('express-validator');

/**
 * Structural validation for product browsing/search. Bounding `search`
 * length and `limit`'s range isn't security-critical on its own (the
 * Security Engine already blocks attack payloads upstream) but it's still
 * good API hygiene — it stops a client from requesting an unreasonably
 * large page size, independent of any malicious intent.
 */
const listProductsValidators = [
  query('search').optional().trim().isLength({ max: 200 }).withMessage('Search term too long'),
  query('category').optional().trim().isLength({ max: 100 }).withMessage('Category filter too long'),
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer').toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('limit must be between 1 and 50').toInt(),
];

const productIdParamValidator = [param('id').isMongoId().withMessage('Invalid product id')];

module.exports = { listProductsValidators, productIdParamValidator };