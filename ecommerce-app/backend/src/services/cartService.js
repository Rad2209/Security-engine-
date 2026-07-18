const { Cart, Product } = require('../models');

/**
 * cartService
 *
 * Every mutation uses a single atomic MongoDB update (findOneAndUpdate with
 * $inc/$push/$pull/$set) rather than "fetch document, mutate in memory,
 * save". The fetch-mutate-save pattern has a real race condition: two
 * concurrent requests to add the same item could both read quantity=1 and
 * both write quantity=2, silently losing an increment. Atomic operators
 * avoid that entirely and cost one round-trip instead of two.
 */

async function getOrCreateCart(userId) {
  return Cart.findOneAndUpdate(
    { userId },
    { $setOnInsert: { userId, items: [] } },
    { new: true, upsert: true }
  ).populate('items.productId');
}

async function addItem(userId, { productId, quantity }) {
  const productExists = await Product.exists({ _id: productId });
  if (!productExists) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }

  // Try incrementing an existing line item first.
  let cart = await Cart.findOneAndUpdate(
    { userId, 'items.productId': productId },
    { $inc: { 'items.$.quantity': quantity } },
    { new: true }
  );

  // No existing line item matched — push a new one, upserting the cart
  // itself if this is the user's first-ever item.
  if (!cart) {
    cart = await Cart.findOneAndUpdate(
      { userId },
      { $push: { items: { productId, quantity } }, $setOnInsert: { userId } },
      { new: true, upsert: true }
    );
  }

  return cart.populate('items.productId');
}

async function updateItemQuantity(userId, productId, quantity) {
  const cart = await Cart.findOneAndUpdate(
    { userId, 'items.productId': productId },
    { $set: { 'items.$.quantity': quantity } },
    { new: true }
  );

  if (!cart) {
    const err = new Error('Item not found in cart');
    err.statusCode = 404;
    throw err;
  }

  return cart.populate('items.productId');
}

async function removeItem(userId, productId) {
  const cart = await Cart.findOneAndUpdate(
    { userId },
    { $pull: { items: { productId } } },
    { new: true }
  );

  if (!cart) {
    const err = new Error('Cart not found');
    err.statusCode = 404;
    throw err;
  }

  return cart.populate('items.productId');
}

async function clearCart(userId) {
  return Cart.findOneAndUpdate({ userId }, { $set: { items: [] } }, { new: true, upsert: true });
}

module.exports = { getOrCreateCart, addItem, updateItemQuantity, removeItem, clearCart };