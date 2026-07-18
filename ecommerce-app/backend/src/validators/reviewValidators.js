const { body, param } = require('express-validator');

const productIdParamValidator = [param('id').isMongoId().withMessage('Invalid product id')];

/**
 * Structural validation only — rating must be a real 1-5 integer, comment
 * must be non-empty and length-bounded. Whether the comment CONTAINS an
 * attack payload is not this file's concern; that's the Security Engine's
 * job, running earlier in the pipeline (see docs/architecture §10).
 */
const createReviewValidators = [
  ...productIdParamValidator,
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5')
    .toInt(),
  body('comment')
    .trim()
    .notEmpty()
    .withMessage('Comment is required')
    .isLength({ max: 1000 })
    .withMessage('Comment cannot exceed 1000 characters'),
];

module.exports = { productIdParamValidator, createReviewValidators };