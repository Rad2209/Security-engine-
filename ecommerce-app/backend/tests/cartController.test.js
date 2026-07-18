process.env.MONGO_URI = 'mongodb://fake-host-for-tests/ecommerce';
process.env.JWT_SECRET = 'test-secret-not-for-production';
process.env.FRONTEND_URL = 'http://localhost:5173';

jest.mock('../src/models', () => ({
  Cart: {
    findOneAndUpdate: jest.fn(),
  },
  Product: {
    exists: jest.fn(),
  },
}));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const { Cart, Product } = require('../src/models');
const createApp = require('../src/app');

const allowAll = (req, res, next) => next();
const app = createApp(allowAll);

const PRODUCT_ID = '507f1f77bcf86cd799439011';

function authCookie(userId = 'user-1') {
  const token = jwt.sign({ sub: userId, role: 'customer' }, process.env.JWT_SECRET, { expiresIn: '1h' });
  return [`token=${token}`];
}

afterEach(() => jest.clearAllMocks());

describe('Cart routes require authentication', () => {
  test('GET /api/cart returns 401 without a cookie', async () => {
    const res = await request(app).get('/api/cart');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/cart', () => {
  test('returns the (possibly newly created) cart', async () => {
    Cart.findOneAndUpdate.mockReturnValue({
      populate: jest.fn().mockResolvedValue({ userId: 'user-1', items: [] }),
    });

    const res = await request(app).get('/api/cart').set('Cookie', authCookie());
    expect(res.status).toBe(200);
    expect(res.body.data.items).toEqual([]);
  });
});

describe('POST /api/cart', () => {
  test('rejects an invalid productId at the validator layer', async () => {
    const res = await request(app)
      .post('/api/cart')
      .set('Cookie', authCookie())
      .send({ productId: 'not-an-id', quantity: 1 });

    expect(res.status).toBe(422);
    expect(Product.exists).not.toHaveBeenCalled();
  });

  test('rejects a non-positive quantity', async () => {
    const res = await request(app)
      .post('/api/cart')
      .set('Cookie', authCookie())
      .send({ productId: PRODUCT_ID, quantity: 0 });

    expect(res.status).toBe(422);
  });

  test('adds the item when input is valid and the product exists', async () => {
    Product.exists.mockResolvedValue(true);
    Cart.findOneAndUpdate
      .mockResolvedValueOnce(null) // no existing line item
      .mockResolvedValueOnce({
        populate: jest.fn().mockResolvedValue({ items: [{ productId: PRODUCT_ID, quantity: 2 }] }),
      });

    const res = await request(app)
      .post('/api/cart')
      .set('Cookie', authCookie())
      .send({ productId: PRODUCT_ID, quantity: 2 });

    expect(res.status).toBe(201);
    expect(res.body.data.items[0].quantity).toBe(2);
  });

  test('returns 404 when the product does not exist', async () => {
    Product.exists.mockResolvedValue(false);

    const res = await request(app)
      .post('/api/cart')
      .set('Cookie', authCookie())
      .send({ productId: PRODUCT_ID, quantity: 1 });

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/cart/:productId', () => {
  test('rejects a non-positive quantity', async () => {
    const res = await request(app)
      .put(`/api/cart/${PRODUCT_ID}`)
      .set('Cookie', authCookie())
      .send({ quantity: -1 });

    expect(res.status).toBe(422);
  });

  test('returns 404 if the item is not in the cart', async () => {
    Cart.findOneAndUpdate.mockResolvedValue(null);

    const res = await request(app)
      .put(`/api/cart/${PRODUCT_ID}`)
      .set('Cookie', authCookie())
      .send({ quantity: 3 });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/cart/:productId and DELETE /api/cart', () => {
  test('removing a single item returns the updated cart', async () => {
    Cart.findOneAndUpdate.mockResolvedValue({
      populate: jest.fn().mockResolvedValue({ items: [] }),
    });

    const res = await request(app).delete(`/api/cart/${PRODUCT_ID}`).set('Cookie', authCookie());
    expect(res.status).toBe(200);
  });

  test('clearing the whole cart returns an empty cart', async () => {
    Cart.findOneAndUpdate.mockResolvedValue({ items: [] });

    const res = await request(app).delete('/api/cart').set('Cookie', authCookie());
    expect(res.status).toBe(200);
    expect(res.body.data.items).toEqual([]);
  });
});