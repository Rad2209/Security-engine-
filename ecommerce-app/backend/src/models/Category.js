const mongoose = require('mongoose');

/**
 * Category
 *
 * Simple lookup entity referenced by Product.categoryId. `slug` is stored
 * (not derived on the fly) so product listing URLs/filters stay stable even
 * if the display name changes later.
 */
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Category || mongoose.model('Category', categorySchema);