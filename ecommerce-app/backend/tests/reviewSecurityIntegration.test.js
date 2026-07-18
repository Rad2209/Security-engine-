process.env.MONGO_URI = 'mongodb://fake-host-for-tests/ecommerce';
process.env.JWT_SECRET = 'test-secret-not-for-production';
process.env.FRONTEND_URL = 'http://localhost:5173';

jest.mock('../src/models', () => ({
  Review: { find: jest.fn(), create: jest.fn() },
  Product: { exists: jest.fn(), find: jest.fn(), countDocuments: jest.fn(), findById: jest.fn() },
  Category: { findOne: jest.fn() },
}));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const { Review, Product } = require('../src/models');
const createApp = require('../src/app');
const SecurityEngine = require('security-engine');

const PRODUCT_ID = '507f1f77bcf86cd799439011';

const fakeAdapter = {
  isIpBlocked: async () => false,
  isAccountBlocked: async () => false,
  recordFailedAttempt: async () => {},
  countRecentAttempts: async () => ({ ipCount: 0, accountCount: 0 }),
  resetAttempts: async () => {},
  createBlock: async () => {},
  unblockIp: async () => {},
  saveAttackLog: async () => {},
  getLogs: async () => [],
};

const realSecurityMiddleware = SecurityEngine.init({ storageAdapter: fakeAdapter });
const app = createApp(realSecurityMiddleware);

function signCustomerToken(userId) {
  return jwt.sign({ sub: userId, role: 'customer' }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

afterEach(() => jest.clearAllMocks());

describe('Real Security Engine — product search', () => {
  test('blocks a SQL injection payload in the search query string', async () => {
    const res = await request(app).get("/api/products").query({ search: "' OR 1=1--" });
    expect(res.status).toBe(403);
    expect(Product.find).not.toHaveBeenCalled();
  });
});

describe('Real Security Engine — review submission', () => {
  test('blocks an XSS payload in the review comment BEFORE authMiddleware or the controller run', async () => {
    // Deliberately no auth cookie is attached. If this test gets a 401
    // instead of 403, it would mean authMiddleware ran before the Security
    // Engine did — the opposite of the required middleware order in
    // app.js. Getting 403 proves the engine's global mount position is
    // correct.
    const res = await request(app)
      .post(`/api/products/${PRODUCT_ID}/reviews`)
      .send({ rating: 5, comment: '<script>document.cookie</script>' });

    expect(res.status).toBe(403);
    expect(Review.create).not.toHaveBeenCalled();
  });

  test('blocks a SQL injection payload in the review comment', async () => {
    const token = signCustomerToken('user-1');

    const res = await request(app)
      .post(`/api/products/${PRODUCT_ID}/reviews`)
      .set('Cookie', [`token=${token}`])
      .send({ rating: 5, comment: "'; DROP TABLE reviews; --" });

    expect(res.status).toBe(403);
    expect(Review.create).not.toHaveBeenCalled();
  });

  test('allows a clean review through to the controller and service', async () => {
    Product.exists.mockResolvedValue(true);
    Review.create.mockImplementation(async (data) => ({ _id: 'r1', ...data }));

    const token = signCustomerToken('user-1');

    const res = await request(app)
      .post(`/api/products/${PRODUCT_ID}/reviews`)
      .set('Cookie', [`token=${token}`])
      .send({ rating: 5, comment: 'This product exceeded my expectations!' });

    expect(res.status).toBe(201);
    expect(Review.create).toHaveBeenCalledTimes(1);
  });
});