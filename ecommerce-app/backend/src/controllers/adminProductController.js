const productService = require('../services/productService');
const { success } = require('../utils/apiResponse');

async function listAllProductsHandler(req, res, next) {
  try {
    const products = await productService.listAllProductsForAdmin();
    return success(res, products);
  } catch (err) {
    return next(err);
  }
}

module.exports = { listAllProductsHandler };