process.env.MONGO_URI = 'mongodb://fake-host-for-tests/ecommerce';
process.env.JWT_SECRET = 'test-secret-not-for-production';
process.env.FRONTEND_URL = 'http://localhost:5173';

jest.mock('../src/models', () => ({
  User: { find: jest.fn() },
  Product: { find: jest.fn() },
}));

jest.mock('../src/middleware/securityAdapter', () => ({
  getLogs: jest.fn(),
  listBlockedIps: jest.fn(),
  unblockIp: jest.fn(),
  getStats: jest.fn(),
}));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const { User, Product } = require('../src/models');
const securityAdapter = require('../src/middleware/securityAdapter');
const createApp = require('../src/app');

const allowAll = (req, res, next) => next();
const app = createApp(allowAll);

function signAdminToken() {
  return jwt.sign({ sub: 'admin-1', role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

function signCustomerToken() {
  return jwt.sign({ sub: 'user-1', role: 'customer' }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

afterEach(() => jest.clearAllMocks());

describe('Admin dashboard routes require a verified admin session', () => {
  const protectedRoutes = [
    { method: 'get', path: '/api/admin/users' },
    { method: 'get', path: '/api/admin/products' },
    { method: 'get', path: '/api/admin/logs' },
    { method: 'get', path: '/api/admin/blocked-ips' },
    { method: 'get', path: '/api/admin/stats' },
    { method: 'patch', path: '/api/admin/blocked-ips/1.2.3.4/unblock' },
  ];

  test.each(protectedRoutes)('$method $path returns 401 with no cookie at all', async ({ method, path }) => {
    const res = await request(app)[method](path);
    expect(res.status).toBe(401);
  });

  test.each(protectedRoutes)(
    '$method $path returns 401 when authenticated as a customer, not an admin',
    async ({ method, path }) => {
      const token = signCustomerToken();
      const res = await request(app)[method](path).set('Cookie', [`token=${token}`]);
      // Customer's cookie is named "token", not "adminToken" — adminAuthMiddleware
      // only reads "adminToken", so this should behave like no cookie at all (401),
      // proving the two cookie namespaces genuinely don't cross over.
      expect(res.status).toBe(401);
    }
  );
});

describe('GET /api/admin/users', () => {
  test('returns the user list for a verified admin', async () => {
    const leanMock = jest.fn().mockResolvedValue([{ name: 'Jane', email: 'jane@example.com' }]);
    const sortMock = jest.fn(() => ({ lean: leanMock }));
    User.find.mockReturnValue({ select: jest.fn(() => ({ sort: sortMock })) });

    const token = signAdminToken();
    const res = await request(app).get('/api/admin/users').set('Cookie', [`adminToken=${token}`]);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([{ name: 'Jane', email: 'jane@example.com' }]);
  });
});

describe('GET /api/admin/products', () => {
  test('returns the full product list for a verified admin', async () => {
    const sortMock = jest.fn().mockResolvedValue([{ name: 'Laptop' }]);
    Product.find.mockReturnValue({ populate: jest.fn(() => ({ sort: sortMock })) });

    const token = signAdminToken();
    const res = await request(app).get('/api/admin/products').set('Cookie', [`adminToken=${token}`]);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([{ name: 'Laptop' }]);
  });
});

describe('GET /api/admin/logs', () => {
  test('rejects an invalid type filter at the validator layer', async () => {
    const token = signAdminToken();
    const res = await request(app)
      .get('/api/admin/logs?type=NOT_A_REAL_TYPE')
      .set('Cookie', [`adminToken=${token}`]);

    expect(res.status).toBe(422);
    expect(securityAdapter.getLogs).not.toHaveBeenCalled();
  });

  test('passes valid filters through to the adapter', async () => {
    securityAdapter.getLogs.mockResolvedValue([{ type: 'XSS', ip: '1.2.3.4' }]);
    const token = signAdminToken();

    const res = await request(app)
      .get('/api/admin/logs?type=XSS&limit=20')
      .set('Cookie', [`adminToken=${token}`]);

    expect(res.status).toBe(200);
    expect(securityAdapter.getLogs).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'XSS', limit: 20 })
    );
  });
});

describe('GET /api/admin/blocked-ips and PATCH .../unblock', () => {
  test('lists currently blocked IPs', async () => {
    securityAdapter.listBlockedIps.mockResolvedValue([{ ip: '1.2.3.4', reason: 'too many attempts' }]);
    const token = signAdminToken();

    const res = await request(app).get('/api/admin/blocked-ips').set('Cookie', [`adminToken=${token}`]);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([{ ip: '1.2.3.4', reason: 'too many attempts' }]);
  });

  test('unblocks a specific IP', async () => {
    const token = signAdminToken();

    const res = await request(app)
      .patch('/api/admin/blocked-ips/1.2.3.4/unblock')
      .set('Cookie', [`adminToken=${token}`]);

    expect(res.status).toBe(200);
    expect(securityAdapter.unblockIp).toHaveBeenCalledWith('1.2.3.4');
  });
});

describe('GET /api/admin/stats', () => {
  test('returns aggregate security statistics', async () => {
    securityAdapter.getStats.mockResolvedValue({
      totalAttacks: 12,
      byType: { SQL_INJECTION: 5, XSS: 4, BRUTE_FORCE: 3 },
      activeBlockedIps: 2,
      activeBlockedAccounts: 1,
    });
    const token = signAdminToken();

    const res = await request(app).get('/api/admin/stats').set('Cookie', [`adminToken=${token}`]);

    expect(res.status).toBe(200);
    expect(res.body.data.totalAttacks).toBe(12);
    expect(res.body.data.byType).toEqual({ SQL_INJECTION: 5, XSS: 4, BRUTE_FORCE: 3 });
  });
});