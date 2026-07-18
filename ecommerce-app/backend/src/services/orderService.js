const { Cart, Product, Order } = require('../models');

/**
 * orderService.checkout
 *
 * Converts the user's current cart into an Order. Re-validates stock at
 * this moment (not just when items were added — stock may have changed
 * since), snapshots each product's CURRENT price into priceAtPurchase so
 * later price changes never rewrite order history, decrements stock, then
 * empties the cart. This is a simulation (per project scope: no real
 * payment gateway), so "checkout" here just means "commit the order".
 */
async function checkout(userId) {
  const cart = await Cart.findOne({ userId }).populate('items.productId');

  if (!cart || cart.items.length === 0) {
    const err = new Error('Cart is empty');
    err.statusCode = 400;
    throw err;
  }

  const orderItems = [];
  let totalAmount = 0;

  for (const item of cart.items) {
    const product = item.productId; // populated document

    if (!product) {
      const err = new Error('One or more products in your cart no longer exist');
      err.statusCode = 400;
      throw err;
    }

    if (product.stock < item.quantity) {
      const err = new Error(`Insufficient stock for "${product.name}"`);
      err.statusCode = 400;
      throw err;
    }

    orderItems.push({
      productId: product._id,
      quantity: item.quantity,
      priceAtPurchase: product.price,
    });
    totalAmount += product.price * item.quantity;
  }

  // Decrement stock per product as independent atomic updates — one
  // product's stock change doesn't need to wait on another's.
  await Promise.all(
    orderItems.map((item) =>
      Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } })
    )
  );

  const order = await Order.create({ userId, items: orderItems, totalAmount });

  await Cart.findOneAndUpdate({ userId }, { $set: { items: [] } });

  return order;
}

async function listOrdersForUser(userId) {
  return Order.find({ userId }).sort({ createdAt: -1 });
}

module.exports = { checkout, listOrdersForUser };