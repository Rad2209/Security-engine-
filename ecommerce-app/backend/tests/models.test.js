const mongoose = require('mongoose');
const { User, Admin, Category, Product, Review, Cart, Order } = require('../src/models');

/**
 * These tests use validateSync() rather than .save(), which means they run
 * schema-level validation (required fields, enums, min/max) without needing
 * a live MongoDB connection. Uniqueness constraints (email, slug) are
 * enforced by MongoDB indexes at write time, NOT by schema validation, so
 * they can't be exercised here — that's a real integration-test concern for
 * whenever we have a live/in-memory database wired up, noted as a gap
 * rather than silently skipped.
 */

describe('User model', () => {
  test('rejects a document missing required fields', () => {
    const user = new User({});
    const err = user.validateSync();
    expect(err.errors.name).toBeDefined();
    expect(err.errors.email).toBeDefined();
    expect(err.errors.passwordHash).toBeDefined();
  });

  test('rejects an invalid email format', () => {
    const user = new User({ name: 'Jane', email: 'not-an-email', passwordHash: 'hash' });
    const err = user.validateSync();
    expect(err.errors.email).toBeDefined();
  });

  test('accepts a valid document and defaults role to customer', () => {
    const user = new User({ name: 'Jane', email: 'jane@example.com', passwordHash: 'hash' });
    const err = user.validateSync();
    expect(err).toBeUndefined();
    expect(user.role).toBe('customer');
  });
});

describe('Admin model', () => {
  test('rejects a document missing required fields', () => {
    const admin = new Admin({});
    const err = admin.validateSync();
    expect(err.errors.name).toBeDefined();
    expect(err.errors.email).toBeDefined();
    expect(err.errors.passwordHash).toBeDefined();
  });

  test('accepts a valid document and defaults role to admin', () => {
    const admin = new Admin({ name: 'Root Admin', email: 'admin@example.com', passwordHash: 'hash' });
    const err = admin.validateSync();
    expect(err).toBeUndefined();
    expect(admin.role).toBe('admin');
  });
});

describe('Category model', () => {
  test('rejects a document missing name or slug', () => {
    const category = new Category({});
    const err = category.validateSync();
    expect(err.errors.name).toBeDefined();
    expect(err.errors.slug).toBeDefined();
  });

  test('accepts a valid document', () => {
    const category = new Category({ name: 'Electronics', slug: 'electronics' });
    expect(category.validateSync()).toBeUndefined();
  });
});

describe('Product model', () => {
  test('rejects a negative price', () => {
    const product = new Product({
      name: 'Laptop',
      price: -100,
      categoryId: new mongoose.Types.ObjectId(),
    });
    const err = product.validateSync();
    expect(err.errors.price).toBeDefined();
  });

  test('rejects a missing categoryId', () => {
    const product = new Product({ name: 'Laptop', price: 999 });
    const err = product.validateSync();
    expect(err.errors.categoryId).toBeDefined();
  });

  test('accepts a valid document and defaults stock to 0', () => {
    const product = new Product({
      name: 'Laptop',
      price: 999,
      categoryId: new mongoose.Types.ObjectId(),
    });
    expect(product.validateSync()).toBeUndefined();
    expect(product.stock).toBe(0);
  });
});

describe('Review model', () => {
  test('rejects a rating outside 1-5', () => {
    const tooLow = new Review({
      productId: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(),
      rating: 0,
      comment: 'bad',
    });
    const tooHigh = new Review({
      productId: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(),
      rating: 6,
      comment: 'bad',
    });
    expect(tooLow.validateSync().errors.rating).toBeDefined();
    expect(tooHigh.validateSync().errors.rating).toBeDefined();
  });

  test('accepts a valid document', () => {
    const review = new Review({
      productId: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(),
      rating: 4,
      comment: 'Solid product, works as expected.',
    });
    expect(review.validateSync()).toBeUndefined();
  });
});

describe('Cart model', () => {
  test('rejects an item with quantity below 1', () => {
    const cart = new Cart({
      userId: new mongoose.Types.ObjectId(),
      items: [{ productId: new mongoose.Types.ObjectId(), quantity: 0 }],
    });
    const err = cart.validateSync();
    expect(err.errors['items.0.quantity']).toBeDefined();
  });

  test('accepts an empty cart and a populated cart', () => {
    const emptyCart = new Cart({ userId: new mongoose.Types.ObjectId() });
    expect(emptyCart.validateSync()).toBeUndefined();

    const populatedCart = new Cart({
      userId: new mongoose.Types.ObjectId(),
      items: [{ productId: new mongoose.Types.ObjectId(), quantity: 2 }],
    });
    expect(populatedCart.validateSync()).toBeUndefined();
  });
});

describe('Order model', () => {
  test('rejects an order with an empty items array', () => {
    const order = new Order({
      userId: new mongoose.Types.ObjectId(),
      items: [],
      totalAmount: 0,
    });
    const err = order.validateSync();
    expect(err.errors.items).toBeDefined();
  });

  test('rejects a negative totalAmount', () => {
    const order = new Order({
      userId: new mongoose.Types.ObjectId(),
      items: [{ productId: new mongoose.Types.ObjectId(), quantity: 1, priceAtPurchase: 10 }],
      totalAmount: -5,
    });
    const err = order.validateSync();
    expect(err.errors.totalAmount).toBeDefined();
  });

  test('rejects an invalid status value', () => {
    const order = new Order({
      userId: new mongoose.Types.ObjectId(),
      items: [{ productId: new mongoose.Types.ObjectId(), quantity: 1, priceAtPurchase: 10 }],
      totalAmount: 10,
      status: 'shipped', // not in the enum — checkout is a simulation, scope is intentionally narrow
    });
    const err = order.validateSync();
    expect(err.errors.status).toBeDefined();
  });

  test('accepts a valid document and defaults status to simulated_paid', () => {
    const order = new Order({
      userId: new mongoose.Types.ObjectId(),
      items: [{ productId: new mongoose.Types.ObjectId(), quantity: 2, priceAtPurchase: 25 }],
      totalAmount: 50,
    });
    expect(order.validateSync()).toBeUndefined();
    expect(order.status).toBe('simulated_paid');
  });
});