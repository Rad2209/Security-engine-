process.env.MONGO_URI = 'mongodb://fake-host-for-tests/ecommerce';
process.env.JWT_SECRET = 'test-secret-not-for-production';
process.env.FRONTEND_URL = 'http://localhost:5173';

jest.mock('../src/models', () => ({
  Review: {
    find: jest.fn(),
    create: jest.fn(),
  },
  Product: {
    exists: jest.fn(),
  },
}));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const { Review, Product } = require('../src/models');
const createApp = require('../src/app');

const allowAll = (req, res, next) => next();
const app = createApp(allowAll);

const PRODUCT_ID = '507f1f77bcf86cd799439011';

function signCustomerToken(userId) {
  return jwt.sign({ sub: userId, role: 'customer' }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

afterEach(() => jest.clearAllMocks());

describe('GET /api/products/:id/reviews (public, no auth required)', () => {
  test('returns 404 if the product does not exist', async () => {
    Product.exists.mockResolvedValue(false);
    const res = await request(app).get(`/api/products/${PRODUCT_ID}/reviews`);
    expect(res.status).toBe(404);
  });

  test('returns the review list when the product exists', async () => {
    Product.exists.mockResolvedValue(true);
    const sortMock = jest.fn().mockResolvedValue([{ comment: 'Nice!' }]);
    Review.find.mockReturnValue({ populate: jest.fn(() => ({ sort: sortMock })) });

    const res = await request(app).get(`/api/products/${PRODUCT_ID}/reviews`);
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([{ comment: 'Nice!' }]);
  });
});

describe('POST /api/products/:id/reviews (requires auth)', () => {
  test('rejects with 401 when no auth cookie is present', async () => {
    const res = await request(app)
      .post(`/api/products/${PRODUCT_ID}/reviews`)
      .send({ rating: 5, comment: 'Great product' });

    expect(res.status).toBe(401);
    expect(Review.create).not.toHaveBeenCalled();
  });

  test('rejects malformed input (rating out of range) at the validator layer', async () => {
    const token = signCustomerToken('user-1');
    const res = await request(app)
      .post(`/api/products/${PRODUCT_ID}/reviews`)
      .set('Cookie', [`token=${token}`])
      .send({ rating: 10, comment: 'Great product' });

    expect(res.status).toBe(422);
    expect(Review.create).not.toHaveBeenCalled();
  });

  test('creates a review using the userId from the verified token, ignoring any userId in the body', async () => {
    Product.exists.mockResolvedValue(true);
    Review.create.mockImplementation(async (data) => ({ _id: 'new-review', ...data }));

    const token = signCustomerToken('real-user-id');

    const res = await request(app)
      .post(`/api/products/${PRODUCT_ID}/reviews`)
      .set('Cookie', [`token=${token}`])
      // Attempting to impersonate a different user via the body — this
      // must be ignored.
      .send({ rating: 5, comment: 'Great product', userId: 'someone-elses-id' });

    expect(res.status).toBe(201);
    const createArgs = Review.create.mock.calls[0][0];
    expect(createArgs.userId).toBe('real-user-id'); // from the token, not the body
    expect(createArgs.userId).not.toBe('someone-elses-id');
  });

  test('returns 404 if the product does not exist', async () => {
    Product.exists.mockResolvedValue(false);
    const token = signCustomerToken('user-1');

    const res = await request(app)
      .post(`/api/products/${PRODUCT_ID}/reviews`)
      .set('Cookie', [`token=${token}`])
      .send({ rating: 5, comment: 'Great product' });

    expect(res.status).toBe(404);
  });
});