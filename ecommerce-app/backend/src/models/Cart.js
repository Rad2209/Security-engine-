const mongoose = require('mongoose');

/**
 * Cart
 *
 * One cart per user (userId is unique) — rather than modeling a cart as its
 * own independently-addressable resource with its own id lookups. This
 * matches how the customer-facing feature actually behaves ("my cart"),
 * and keeps CartService lookups to a single findOne({ userId }) call.
 */
const cartItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required'],
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
      default: 1,
    },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
    },
    items: {
      type: [cartItemSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Cart || mongoose.model('Cart', cartSchema);