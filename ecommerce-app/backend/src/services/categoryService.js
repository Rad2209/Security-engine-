const { Category } = require('../models');

async function listCategories() {
  return Category.find().sort({ name: 1 }).lean();
}

module.exports = { listCategories };