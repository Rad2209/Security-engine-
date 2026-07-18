const express = require('express');
const { listProductsHandler, getProductHandler } = require('../controllers/productController');
const { listReviewsHandler, createReviewHandler } = require('../controllers/reviewController');
const {
  listProductsValidators,
  productIdParamValidator,
} = require('../validators/productValidators');
const { createReviewValidators } = require('../validators/reviewValidators');
const handleValidation = require('../validators/handleValidation');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Browsing and reading reviews are public — no auth required.
router.get('/', listProductsValidators, handleValidation, listProductsHandler);
router.get('/:id', productIdParamValidator, handleValidation, getProductHandler);
router.get('/:id/reviews', productIdParamValidator, handleValidation, listReviewsHandler);

// Submitting a review requires a logged-in customer — authMiddleware runs
// first so req.user is populated before createReviewHandler ever executes.
router.post(
  '/:id/reviews',
  authMiddleware,
  createReviewValidators,
  handleValidation,
  createReviewHandler
);

module.exports = router;