jest.mock('../src/models', () => ({
  Cart: {
    findOneAndUpdate: jest.fn(),
  },
  Product: {
    exists: jest.fn(),
  },
}));

const { Cart, Product } = require('../src/models');
const cartService = require('../src/services/cartService');

afterEach(() => jest.clearAllMocks());

describe('cartService.getOrCreateCart', () => {
  test('upserts an empty cart and populates items', async () => {
    const populateMock = jest.fn().mockResolvedValue({ userId: 'u1', items: [] });
    Cart.findOneAndUpdate.mockReturnValue({ populate: populateMock });

    const result = await cartService.getOrCreateCart('u1');

    expect(Cart.findOneAndUpdate).toHaveBeenCalledWith(
      { userId: 'u1' },
      { $setOnInsert: { userId: 'u1', items: [] } },
      { new: true, upsert: true }
    );
    expect(result.items).toEqual([]);
  });
});

describe('cartService.addItem', () => {
  test('throws 404 if the product does not exist, without touching the cart', async () => {
    Product.exists.mockResolvedValue(false);

    await expect(cartService.addItem('u1', { productId: 'p1', quantity: 1 })).rejects.toMatchObject({
      statusCode: 404,
    });
    expect(Cart.findOneAndUpdate).not.toHaveBeenCalled();
  });

  test('increments quantity via $inc when the item already exists in the cart', async () => {
    Product.exists.mockResolvedValue(true);
    const fakeCart = { populate: jest.fn().mockResolvedValue({ items: [{ productId: 'p1', quantity: 3 }] }) };
    Cart.findOneAndUpdate.mockResolvedValueOnce(fakeCart);

    const result = await cartService.addItem('u1', { productId: 'p1', quantity: 2 });

    expect(Cart.findOneAndUpdate).toHaveBeenCalledWith(
      { userId: 'u1', 'items.productId': 'p1' },
      { $inc: { 'items.$.quantity': 2 } },
      { new: true }
    );
    expect(result.items[0].quantity).toBe(3);
  });

  test('pushes a new line item when it does not already exist in the cart', async () => {
    Product.exists.mockResolvedValue(true);
    // First call (the $inc attempt) resolves null — no existing item.
    Cart.findOneAndUpdate.mockResolvedValueOnce(null);
    const fakeCart = { populate: jest.fn().mockResolvedValue({ items: [{ productId: 'p1', quantity: 2 }] }) };
    Cart.findOneAndUpdate.mockResolvedValueOnce(fakeCart);

    const result = await cartService.addItem('u1', { productId: 'p1', quantity: 2 });

    expect(Cart.findOneAndUpdate).toHaveBeenCalledTimes(2);
    expect(Cart.findOneAndUpdate).toHaveBeenNthCalledWith(
      2,
      { userId: 'u1' },
      { $push: { items: { productId: 'p1', quantity: 2 } }, $setOnInsert: { userId: 'u1' } },
      { new: true, upsert: true }
    );
    expect(result.items[0].quantity).toBe(2);
  });
});

describe('cartService.updateItemQuantity', () => {
  test('throws 404 if no cart/item matched the filter', async () => {
    Cart.findOneAndUpdate.mockResolvedValue(null);

    await expect(cartService.updateItemQuantity('u1', 'p1', 5)).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  test('sets the quantity via $set when the item is found', async () => {
    const fakeCart = { populate: jest.fn().mockResolvedValue({ items: [{ productId: 'p1', quantity: 5 }] }) };
    Cart.findOneAndUpdate.mockResolvedValue(fakeCart);

    const result = await cartService.updateItemQuantity('u1', 'p1', 5);

    expect(Cart.findOneAndUpdate).toHaveBeenCalledWith(
      { userId: 'u1', 'items.productId': 'p1' },
      { $set: { 'items.$.quantity': 5 } },
      { new: true }
    );
    expect(result.items[0].quantity).toBe(5);
  });
});

describe('cartService.removeItem', () => {
  test('throws 404 if the cart does not exist', async () => {
    Cart.findOneAndUpdate.mockResolvedValue(null);

    await expect(cartService.removeItem('u1', 'p1')).rejects.toMatchObject({ statusCode: 404 });
  });

  test('pulls the item from the cart when the cart exists', async () => {
    const fakeCart = { populate: jest.fn().mockResolvedValue({ items: [] }) };
    Cart.findOneAndUpdate.mockResolvedValue(fakeCart);

    const result = await cartService.removeItem('u1', 'p1');

    expect(Cart.findOneAndUpdate).toHaveBeenCalledWith(
      { userId: 'u1' },
      { $pull: { items: { productId: 'p1' } } },
      { new: true }
    );
    expect(result.items).toEqual([]);
  });
});

describe('cartService.clearCart', () => {
  test('sets items to an empty array, upserting if needed', async () => {
    Cart.findOneAndUpdate.mockResolvedValue({ items: [] });

    const result = await cartService.clearCart('u1');

    expect(Cart.findOneAndUpdate).toHaveBeenCalledWith(
      { userId: 'u1' },
      { $set: { items: [] } },
      { new: true, upsert: true }
    );
    expect(result.items).toEqual([]);
  });
});