const productService = require('../services/productService');
const { success } = require('../utils/apiResponse');

async function listProductsHandler(req, res, next) {
  try {
    const { search, category, page, limit } = req.query;
    const result = await productService.listProducts({ search, category, page, limit });
    return success(res, result);
  } catch (err) {
    return next(err);
  }
}

async function getProductHandler(req, res, next) {
  try {
    const product = await productService.getProductById(req.params.id);
    return success(res, product);
  } catch (err) {
    return next(err);
  }
}

module.exports = { listProductsHandler, getProductHandler };