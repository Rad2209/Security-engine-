require('dotenv').config();
const connectDB = require('../src/config/db');
const { Category, Product } = require('../src/models');

/**
 * scripts/seedProducts.js
 *
 * Populates demo categories and products for Escapement. Per the project's
 * scope decision (admin dashboard is view-only for products, no create/
 * edit/delete endpoint exists), this script — run manually, once — is the
 * only mechanism that puts product data into the database. Same pattern
 * as seedAdmin.js.
 *
 * Idempotent: matches on `slug` (categories) and `name` (products), so
 * re-running this after adding new entries won't duplicate existing ones.
 *
 * Usage:
 *   node scripts/seedProducts.js
 */

const CATEGORIES = [
  { name: 'Watches', slug: 'watches', description: 'Premium timepieces with modern style.' },
];

// categorySlug ties each product to a category above without needing real
// ObjectIds yet — resolved to actual _id values during the seed run.
const PRODUCTS = [
  {
    categorySlug: 'watches',
    name: 'Classic Chronograph',
    description: 'Sleek stainless steel chronograph with a polished bezel and luminous dial.',
    price: 420,
    stock: 18,
    images: ['https://www-konga-com-res.cloudinary.com/image/upload/f_auto,q_auto,w_400,c_limit/media/catalog/product/O/R/61668_1785289696.jpg'],
  },
  {
    categorySlug: 'watches',
    name: 'Luxe GMT Watch',
    description: 'Bold GMT design with a refined bracelet and clear dual-time display.',
    price: 650,
    stock: 12,
    images: ['https://www-konga-com-res.cloudinary.com/image/upload/f_auto,q_auto,w_400,c_limit/media/catalog/product/H/W/239986_1785095195.jpg'],
  },
  {
    categorySlug: 'watches',
    name: 'Urban Sport Watch',
    description: 'Comfortable everyday watch with a slim profile and modern dial details.',
    price: 380,
    stock: 22,
    images: ['https://www-konga-com-res.cloudinary.com/image/upload/f_auto,q_auto,w_400,c_limit/media/catalog/product/V/Q/239986_1785072555.jpg'],
  },
  {
    categorySlug: 'watches',
    name: 'Executive Dress Watch',
    description: 'Minimal dress watch with a polished finish and understated elegance.',
    price: 890,
    stock: 7,
    images: ['https://www-konga-com-res.cloudinary.com/image/upload/f_auto,q_auto,w_400,c_limit/media/catalog/product/U/S/239986_1784868780.jpg'],
  },
  {
    categorySlug: 'watches',
    name: 'Signature Steel Watch',
    description: 'Clean-lined steel watch designed for daily wear and versatile styling.',
    price: 540,
    stock: 15,
    images: ['https://www-konga-com-res.cloudinary.com/image/upload/f_auto,q_auto,w_400,c_limit/media/catalog/product/N/R/239986_1784690858.jpg'],
  },
];

async function seed() {
  await connectDB();
  console.log('Connected to MongoDB. Seeding...');

  const categoryIdBySlug = {};

  for (const cat of CATEGORIES) {
    const existing = await Category.findOneAndUpdate(
      { slug: cat.slug },
      { $setOnInsert: cat },
      { upsert: true, new: true }
    );
    categoryIdBySlug[cat.slug] = existing._id;
    console.log(`Category ready: ${existing.name}`);
  }

  for (const { categorySlug, ...productData } of PRODUCTS) {
    const categoryId = categoryIdBySlug[categorySlug];

    const result = await Product.findOneAndUpdate(
      { name: productData.name },
      { $setOnInsert: { ...productData, categoryId } },
      { upsert: true, new: true }
    );
    console.log(`Product ready: ${result.name}`);
  }

  console.log(`\nDone. ${CATEGORIES.length} categories, ${PRODUCTS.length} products.`);
  await require('mongoose').disconnect();
}

seed().catch((err) => {
  console.error('Failed to seed products:', err);
  process.exit(1);
});