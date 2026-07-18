const mongoose = require('mongoose');

/**
 * Review
 *
 * A review always belongs to exactly one product and one user. `comment`
 * is the field the XSS detector will scrutinize most closely in Phase 6,
 * since it's free-text, user-supplied, and rendered back to other users —
 * exactly the shape of field XSS payloads target.
 */
const reviewSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      required: [true, 'Comment is required'],
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Review || mongoose.model('Review', reviewSchema);