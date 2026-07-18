const orderService = require('../services/orderService');
const { success } = require('../utils/apiResponse');

async function checkoutHandler(req, res, next) {
  try {
    const order = await orderService.checkout(req.user.id);
    return success(res, order, 201);
  } catch (err) {
    return next(err);
  }
}

async function listOrdersHandler(req, res, next) {
  try {
    const orders = await orderService.listOrdersForUser(req.user.id);
    return success(res, orders);
  } catch (err) {
    return next(err);
  }
}

module.exports = { checkoutHandler, listOrdersHandler };