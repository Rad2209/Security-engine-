const cartService = require('../services/cartService');
const { success } = require('../utils/apiResponse');

async function getCartHandler(req, res, next) {
  try {
    const cart = await cartService.getOrCreateCart(req.user.id);
    return success(res, cart);
  } catch (err) {
    return next(err);
  }
}

async function addItemHandler(req, res, next) {
  try {
    const { productId, quantity } = req.body;
    const cart = await cartService.addItem(req.user.id, { productId, quantity });
    return success(res, cart, 201);
  } catch (err) {
    return next(err);
  }
}

async function updateItemHandler(req, res, next) {
  try {
    const cart = await cartService.updateItemQuantity(req.user.id, req.params.productId, req.body.quantity);
    return success(res, cart);
  } catch (err) {
    return next(err);
  }
}

async function removeItemHandler(req, res, next) {
  try {
    const cart = await cartService.removeItem(req.user.id, req.params.productId);
    return success(res, cart);
  } catch (err) {
    return next(err);
  }
}

async function clearCartHandler(req, res, next) {
  try {
    const cart = await cartService.clearCart(req.user.id);
    return success(res, cart);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getCartHandler,
  addItemHandler,
  updateItemHandler,
  removeItemHandler,
  clearCartHandler,
};