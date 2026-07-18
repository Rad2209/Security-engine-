process.env.MONGO_URI = 'mongodb://fake-host-for-tests/ecommerce';
process.env.JWT_SECRET = 'test-secret-not-for-production';
process.env.FRONTEND_URL = 'http://localhost:5173';

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

const request = require('supertest');
const jwt = require('jsonwebtoken');
const { Cart, Order } = require('../src/models');
const createApp = require('../src/app');

const allowAll = (req, res, next) => next();
const app = createApp(allowAll);

function authCookie(userId = 'user-1') {
  const token = jwt.sign({ sub: userId, role: 'customer' }, process.env.JWT_SECRET, { expiresIn: '1h' });
  return [`token=${token}`];
}

afterEach(() => jest.clearAllMocks());

describe('Order routes require authentication', () => {
  test('POST /api/orders returns 401 without a cookie', async () => {
    const res = await request(app).post('/api/orders');
    expect(res.status).toBe(401);
  });

  test('GET /api/orders returns 401 without a cookie', async () => {
    const res = await request(app).get('/api/orders');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/orders (checkout)', () => {
  test('returns 400 when the cart is empty', async () => {
    Cart.findOne.mockReturnValue({ populate: jest.fn().mockResolvedValue({ items: [] }) });

    const res = await request(app).post('/api/orders').set('Cookie', authCookie());
    expect(res.status).toBe(400);
    expect(Order.create).not.toHaveBeenCalled();
  });

  test('creates the order and returns 201 on a valid cart', async () => {
    const cart = {
      items: [{ productId: { _id: 'p1', name: 'Laptop', price: 1000, stock: 5 }, quantity: 1 }],
    };
    Cart.findOne.mockReturnValue({ populate: jest.fn().mockResolvedValue(cart) });
    Order.create.mockImplementation(async (data) => ({ _id: 'order-1', ...data }));
    Cart.findOneAndUpdate.mockResolvedValue({});

    const res = await request(app).post('/api/orders').set('Cookie', authCookie());

    expect(res.status).toBe(201);
    expect(res.body.data.totalAmount).toBe(1000);
  });
});

describe('GET /api/orders', () => {
  test("returns the user's orders", async () => {
    const sortMock = jest.fn().mockResolvedValue([{ _id: 'order-1', totalAmount: 500 }]);
    Order.find.mockReturnValue({ sort: sortMock });

    const res = await request(app).get('/api/orders').set('Cookie', authCookie());

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([{ _id: 'order-1', totalAmount: 500 }]);
  });
});