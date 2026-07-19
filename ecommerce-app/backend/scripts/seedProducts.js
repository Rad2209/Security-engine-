require('dotenv').config();
const mongoose = require('mongoose');
const env = require('../src/config/env');
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
  { name: 'Watches', slug: 'watches', description: 'Automatic, hand-wound, and quartz timepieces.' },
  { name: 'Straps & Bracelets', slug: 'straps-bracelets', description: 'Leather, metal, and rubber straps.' },
  { name: 'Winders & Storage', slug: 'winders-storage', description: 'Watch winders, cases, and travel rolls.' },
  { name: 'Tools & Care', slug: 'tools-care', description: 'Spring bar tools, case openers, and care kits.' },
];

// categorySlug ties each product to a category above without needing real
// ObjectIds yet — resolved to actual _id values during the seed run.
const PRODUCTS = [
  {
    categorySlug: 'watches',
    name: 'Meridian Field 40',
    description:
      'Automatic field watch. 40mm stainless case, 100m water resistance, 42h power reserve, 28,800vph, sapphire crystal. 21 jewels.',
    price: 420,
    stock: 18,
    images: ['https://picsum.photos/seed/meridian-field-40/700/700'],
  },
  {
    categorySlug: 'watches',
    name: 'Traverse GMT',
    description:
      'Automatic GMT. 42mm case, 100m water resistance, 50h power reserve, 28,800vph, independently adjustable 24h hand. 26 jewels.',
    price: 650,
    stock: 12,
    images: ['https://picsum.photos/seed/traverse-gmt/700/700'],
  },
  {
    categorySlug: 'watches',
    name: 'Depth Chrono 44',
    description:
      'Quartz dive chronograph. 44mm case, 200m water resistance, unidirectional bezel, 1/10s chronograph, luminous markers.',
    price: 380,
    stock: 22,
    images: ['https://picsum.photos/seed/depth-chrono-44/700/700'],
  },
  {
    categorySlug: 'watches',
    name: 'Atelier Dress 38',
    description:
      'Hand-wound dress watch. 38mm case, 30m water resistance, 42h power reserve, 21,600vph, exhibition case back. 17 jewels.',
    price: 890,
    stock: 7,
    images: ['https://picsum.photos/seed/atelier-dress-38/700/700'],
  },
  {
    categorySlug: 'straps-bracelets',
    name: 'Horween Leather Strap — Chestnut',
    description: 'Horween Chromexcel leather, 20mm lug width, quick-release spring bars, brushed buckle.',
    price: 55,
    stock: 40,
    images: ['https://picsum.photos/seed/horween-strap-chestnut/700/700'],
  },
  {
    categorySlug: 'straps-bracelets',
    name: 'Milanese Mesh Bracelet — Brushed Steel',
    description: 'Brushed 316L stainless mesh, 22mm, micro-adjustable sliding clasp.',
    price: 75,
    stock: 30,
    images: ['https://picsum.photos/seed/milanese-mesh-steel/700/700'],
  },
  {
    categorySlug: 'straps-bracelets',
    name: 'FKM Rubber Strap — Graphite',
    description: 'Vulcanized FKM rubber, 22mm, integrated curved lugs, stainless quick-release pins.',
    price: 45,
    stock: 35,
    images: ['https://picsum.photos/seed/fkm-strap-graphite/700/700'],
  },
  {
    categorySlug: 'winders-storage',
    name: 'Single Watch Winder — Walnut',
    description: 'Quiet Mabuchi motor, 4 rotation programs, walnut veneer, holds 1 automatic watch.',
    price: 120,
    stock: 15,
    images: ['https://picsum.photos/seed/single-winder-walnut/700/700'],
  },
  {
    categorySlug: 'winders-storage',
    name: 'Six-Slot Travel Case — Ballistic Nylon',
    description: 'Ballistic nylon exterior, microsuede-lined slots, holds 6 watches, compression strap per slot.',
    price: 65,
    stock: 25,
    images: ['https://picsum.photos/seed/six-slot-travel-case/700/700'],
  },
  {
    categorySlug: 'tools-care',
    name: 'Precision Spring Bar Tool Kit',
    description: 'Fork and pin-style spring bar tools, replacement bar assortment (18-24mm), aluminum case.',
    price: 22,
    stock: 50,
    images: ['https://picsum.photos/seed/spring-bar-tool-kit/700/700'],
  },
  {
    categorySlug: 'tools-care',
    name: 'Case Back Opener — Adjustable',
    description: 'Adjustable two-pin and four-pin case back wrench, fits 0.9mm-3.2mm openings.',
    price: 28,
    stock: 40,
    images: ['https://picsum.photos/seed/case-back-opener/700/700'],
  },
];

async function seed() {
  await mongoose.connect(env.MONGO_URI);
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
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Failed to seed products:', err);
  process.exit(1);
});