const { Review, Product } = require('../models');

/**
 * reviewService
 *
 * Note what's deliberately absent here: no HTML-escaping or sanitization
 * of `comment` before storage. The project's chosen defense against XSS is
 * BLOCKING the request entirely at the Security Engine (see
 * security-engine/src/detectors/XSSDetector.js) rather than storing a
 * sanitized/escaped version and letting a modified request through. If a
 * payload reaches this function at all, the engine already judged it clean
 * — this function has no independent responsibility to re-check that.
 */

async function assertProductExists(productId) {
  const exists = await Product.exists({ _id: productId });

  if (!exists) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }
}

async function listReviewsForProduct(productId) {
  await assertProductExists(productId);
  return Review.find({ productId }).populate('userId', 'name').sort({ createdAt: -1 });
}

/**
 * @param {{ productId: string, userId: string, rating: number, comment: string }} input
 */
async function createReview({ productId, userId, rating, comment }) {
  await assertProductExists(productId);
  return Review.create({ productId, userId, rating, comment });
}

module.exports = { listReviewsForProduct, createReview };