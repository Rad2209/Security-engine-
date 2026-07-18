process.env.MONGO_URI = 'mongodb://fake-host-for-tests/ecommerce';
process.env.JWT_SECRET = 'test-secret-not-for-production';
process.env.FRONTEND_URL = 'http://localhost:5173';
process.env.NODE_ENV = 'development';

jest.mock('../src/models', () => ({
  Admin: {
    findOne: jest.fn(),
  },
}));

jest.mock('../src/middleware/securityAdapter', () => ({
  isIpBlocked: jest.fn().mockResolvedValue(false),
  isAccountBlocked: jest.fn().mockResolvedValue(false),
  recordFailedAttempt: jest.fn().mockResolvedValue(undefined),
  countRecentAttempts: jest.fn().mockResolvedValue({ ipCount: 0, accountCount: 0 }),
  resetAttempts: jest.fn().mockResolvedValue(undefined),
  createBlock: jest.fn().mockResolvedValue(undefined),
  unblockIp: jest.fn().mockResolvedValue(undefined),
  saveAttackLog: jest.fn().mockResolvedValue(undefined),
  getLogs: jest.fn().mockResolvedValue([]),
}));

const request = require('supertest');
const bcrypt = require('bcrypt');
const { Admin } = require('../src/models');
const securityAdapter = require('../src/middleware/securityAdapter');
const createApp = require('../src/app');

const allowAll = (req, res, next) => next();
const app = createApp(allowAll);

afterEach(() => jest.clearAllMocks());

describe('POST /api/admin/login', () => {
  test('succeeds and sets the SEPARATE adminToken cookie (not "token")', async () => {
    const realHash = await bcrypt.hash('correct-password', 10);
    Admin.findOne.mockResolvedValue({ _id: '1', email: 'admin@x.com', role: 'admin', passwordHash: realHash });

    const res = await request(app)
      .post('/api/admin/login')
      .send({ email: 'admin@x.com', password: 'correct-password' });

    expect(res.status).toBe(200);
    const cookies = res.headers['set-cookie'];
    expect(cookies.some((c) => c.startsWith('adminToken=') && c.includes('HttpOnly'))).toBe(true);
    // Confirms the admin flow never sets the customer's cookie name.
    expect(cookies.some((c) => c.startsWith('token='))).toBe(false);
  });

  test('reports the bare email (no prefix) to BruteForceDetector, matching what the engine gate reads', async () => {
    const realHash = await bcrypt.hash('correct-password', 10);
    Admin.findOne.mockResolvedValue({ _id: '1', email: 'admin@x.com', role: 'admin', passwordHash: realHash });

    await request(app).post('/api/admin/login').send({ email: 'admin@x.com', password: 'wrong-password' });

    expect(securityAdapter.recordFailedAttempt).toHaveBeenCalledWith(
      expect.objectContaining({ identifier: 'admin@x.com' }) // bare email, not "admin:admin@x.com"
    );
  });

  test('fails with 401 on wrong password, no cookie set', async () => {
    const realHash = await bcrypt.hash('correct-password', 10);
    Admin.findOne.mockResolvedValue({ _id: '1', email: 'admin@x.com', role: 'admin', passwordHash: realHash });

    const res = await request(app)
      .post('/api/admin/login')
      .send({ email: 'admin@x.com', password: 'wrong-password' });

    expect(res.status).toBe(401);
    expect(res.headers['set-cookie']).toBeUndefined();
  });

  test('does not reveal whether the admin account exists', async () => {
    Admin.findOne.mockResolvedValue(null);

    const res = await request(app).post('/api/admin/login').send({ email: 'nobody@x.com', password: 'whatever' });

    expect(res.status).toBe(401);
    expect(res.body.error.message).toBe('Invalid email or password');
  });
});

describe('POST /api/admin/logout', () => {
  test('clears the adminToken cookie', async () => {
    const res = await request(app).post('/api/admin/logout');
    expect(res.status).toBe(200);
    const cookies = res.headers['set-cookie'];
    expect(cookies.some((c) => c.startsWith('adminToken=;'))).toBe(true);
  });
});

// describe('There is no admin self-registration endpoint', () => {
//   test('POST /api/admin/register does not exist', async () => {
//     const res = await request(app).post('/api/admin/register').send({ email: 'x@x.com', password: 'password123' });
//     expect(res.status).toBe(404);
//   });
// });

describe('There is no admin self-registration endpoint', () => {
  test('POST /api/admin/register requires admin auth before Express even reveals the route does not exist', async () => {
    // router.use(adminAuthMiddleware) applies to every request reaching
    // this router regardless of path, since it's registered without a path
    // filter. That means an unauthenticated request to a nonexistent admin
    // path gets 401, not 404 — a deliberate, favorable security property:
    // an attacker probing /api/admin/* never learns which paths exist
    // without first proving they're an authenticated admin.
    const res = await request(app).post('/api/admin/register').send({ email: 'x@x.com', password: 'password123' });
    expect(res.status).toBe(401);
  });
});