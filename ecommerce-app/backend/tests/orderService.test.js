jest.mock('../src/models', () => ({
  Cart: {
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
  },
  Product: {
    findByIdAndUpdate: jest.fn(),
  },
  Order: {
    find: jest.fn(),
    create: jest.fn(),
  },
}));

const { Cart, Product, Order } = require('../src/models');
const orderService = require('../src/services/orderService');

afterEach(() => jest.clearAllMocks());

describe('orderService.checkout', () => {
  test('throws 400 if the cart is empty or does not exist', async () => {
    Cart.findOne.mockReturnValue({ populate: jest.fn().mockResolvedValue(null) });

    await expect(orderService.checkout('u1')).rejects.toMatchObject({ statusCode: 400 });
    expect(Order.create).not.toHaveBeenCalled();
  });

  test('throws 400 if a cart item has insufficient stock, and creates no order', async () => {
    const cart = {
      items: [{ productId: { _id: 'p1', name: 'Laptop', price: 1000, stock: 1 }, quantity: 5 }],
    };
    Cart.findOne.mockReturnValue({ populate: jest.fn().mockResolvedValue(cart) });

    await expect(orderService.checkout('u1')).rejects.toMatchObject({ statusCode: 400 });
    expect(Order.create).not.toHaveBeenCalled();
    expect(Product.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  test('computes totalAmount from CURRENT product price, decrements stock, clears cart, creates the order', async () => {
    const cart = {
      items: [
        { productId: { _id: 'p1', name: 'Laptop', price: 1000, stock: 5 }, quantity: 2 },
        { productId: { _id: 'p2', name: 'Mouse', price: 25, stock: 10 }, quantity: 3 },
      ],
    };
    Cart.findOne.mockReturnValue({ populate: jest.fn().mockResolvedValue(cart) });
    Product.findByIdAndUpdate.mockResolvedValue({});
    Order.create.mockImplementation(async (data) => ({ _id: 'order-1', ...data }));
    Cart.findOneAndUpdate.mockResolvedValue({});

    const order = await orderService.checkout('u1');

    // 2 * 1000 + 3 * 25 = 2075
    expect(order.totalAmount).toBe(2075);
    expect(order.items).toEqual([
      { productId: 'p1', quantity: 2, priceAtPurchase: 1000 },
      { productId: 'p2', quantity: 3, priceAtPurchase: 25 },
    ]);

    expect(Product.findByIdAndUpdate).toHaveBeenCalledWith('p1', { $inc: { stock: -2 } });
    expect(Product.findByIdAndUpdate).toHaveBeenCalledWith('p2', { $inc: { stock: -3 } });

    expect(Cart.findOneAndUpdate).toHaveBeenCalledWith(
      { userId: 'u1' },
      { $set: { items: [] } }
    );
  });
});

describe('orderService.listOrdersForUser', () => {
  test('returns orders sorted newest-first', async () => {
    const sortMock = jest.fn().mockResolvedValue([{ _id: 'order-1' }]);
    Order.find.mockReturnValue({ sort: sortMock });

    const result = await orderService.listOrdersForUser('u1');

    expect(Order.find).toHaveBeenCalledWith({ userId: 'u1' });
    expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
    expect(result).toEqual([{ _id: 'order-1' }]);
  });
});