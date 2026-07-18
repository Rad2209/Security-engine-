const reviewService = require('../services/reviewService');
const { success } = require('../utils/apiResponse');

async function listReviewsHandler(req, res, next) {
  try {
    const reviews = await reviewService.listReviewsForProduct(req.params.id);
    return success(res, reviews);
  } catch (err) {
    return next(err);
  }
}

async function createReviewHandler(req, res, next) {
  try {
    // userId comes from req.user (populated by authMiddleware from the
    // verified JWT cookie) — deliberately NEVER from req.body. Trusting a
    // client-supplied userId would let anyone submit a review as any other
    // user; this is an authorization concern distinct from anything the
    // Security Engine covers, so it's enforced here explicitly.
    const review = await reviewService.createReview({
      productId: req.params.id,
      userId: req.user.id,
      rating: req.body.rating,
      comment: req.body.comment,
    });
    return success(res, review, 201);
  } catch (err) {
    return next(err);
  }
}

module.exports = { listReviewsHandler, createReviewHandler };