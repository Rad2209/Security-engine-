const categoryService = require('../services/categoryService');
const { success } = require('../utils/apiResponse');

async function listCategoriesHandler(req, res, next) {
  try {
    const categories = await categoryService.listCategories();
    return success(res, categories);
  } catch (err) {
    return next(err);
  }
}

module.exports = { listCategoriesHandler };