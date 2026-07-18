process.env.MONGO_URI = 'mongodb://fake-host-for-tests/ecommerce';
process.env.JWT_SECRET = 'test-secret-not-for-production';
process.env.FRONTEND_URL = 'http://localhost:5173';
process.env.NODE_ENV = 'development'; // -> cookie uses sameSite=Lax, secure=false (matches local dev)

jest.mock('../src/models', () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

// Mocking the adapter (not a real Mongo connection) lets us assert exactly
// how the controller reports login outcomes to the Security Engine, per
// the design in BruteForceDetector.recordFailure/recordSuccess.
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
const { User } = require('../src/models');
const securityAdapter = require('../src/middleware/securityAdapter');
const createApp = require('../src/app');

// The Security Engine's own gate-keeping (blocking malicious payloads
// before this point) is already covered in app.test.js. These tests use an
// allow-all fake so we're purely exercising controller/service/validator
// logic and its brute-force REPORTING calls, not the gate itself.
const allowAll = (req, res, next) => next();
const app = createApp(allowAll);

afterEach(() => jest.clearAllMocks());

describe('POST /api/auth/register', () => {
  test('creates a user and never returns the password hash', async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockImplementation(async (data) => ({ _id: 'new-id', ...data }));

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Jane Doe', email: 'jane@example.com', password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('jane@example.com');
    expect(res.body.data.passwordHash).toBeUndefined();
  });

  test('rejects a duplicate email with 409', async () => {
    User.findOne.mockResolvedValue({ _id: 'existing', email: 'jane@example.com' });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Jane Doe', email: 'jane@example.com', password: 'password123' });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  test('rejects malformed input at the validator layer, before the service runs', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: '', email: 'not-an-email', password: '123' });

    expect(res.status).toBe(422);
    expect(User.findOne).not.toHaveBeenCalled();
  });
});

describe('POST /api/auth/login', () => {
  test('succeeds and sets an httpOnly cookie on correct credentials', async () => {
    const realHash = await bcrypt.hash('correct-password', 10);
    User.findOne.mockResolvedValue({
      _id: '1',
      email: 'jane@example.com',
      role: 'customer',
      passwordHash: realHash,
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'jane@example.com', password: 'correct-password' });

    expect(res.status).toBe(200);

    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies.some((c) => c.startsWith('token=') && c.includes('HttpOnly'))).toBe(true);
  });

  test('reports success to BruteForceDetector (clearing any prior failure count)', async () => {
    const realHash = await bcrypt.hash('correct-password', 10);
    User.findOne.mockResolvedValue({
      _id: '1',
      email: 'jane@example.com',
      role: 'customer',
      passwordHash: realHash,
    });

    await request(app).post('/api/auth/login').send({ email: 'jane@example.com', password: 'correct-password' });

    expect(securityAdapter.resetAttempts).toHaveBeenCalledWith(
      expect.objectContaining({ identifier: 'jane@example.com' })
    );
    expect(securityAdapter.recordFailedAttempt).not.toHaveBeenCalled();
  });

  test('fails with 401 on wrong password and does not set a cookie', async () => {
    const realHash = await bcrypt.hash('correct-password', 10);
    User.findOne.mockResolvedValue({
      _id: '1',
      email: 'jane@example.com',
      role: 'customer',
      passwordHash: realHash,
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'jane@example.com', password: 'wrong-password' });

    expect(res.status).toBe(401);
    expect(res.headers['set-cookie']).toBeUndefined();
  });

  test('reports the failure to BruteForceDetector on wrong password', async () => {
    const realHash = await bcrypt.hash('correct-password', 10);
    User.findOne.mockResolvedValue({
      _id: '1',
      email: 'jane@example.com',
      role: 'customer',
      passwordHash: realHash,
    });

    await request(app).post('/api/auth/login').send({ email: 'jane@example.com', password: 'wrong-password' });

    expect(securityAdapter.recordFailedAttempt).toHaveBeenCalledWith(
      expect.objectContaining({ ip: expect.any(String), identifier: 'jane@example.com' })
    );
  });

  test('does NOT reveal whether the account exists — unknown email behaves identically to wrong password', async () => {
    User.findOne.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'whatever' });

    expect(res.status).toBe(401);
    expect(res.body.error.message).toBe('Invalid email or password');
    expect(securityAdapter.recordFailedAttempt).toHaveBeenCalled();
  });
});

describe('POST /api/auth/logout', () => {
  test('clears the auth cookie', async () => {
    const res = await request(app).post('/api/auth/logout');

    expect(res.status).toBe(200);
    const cookies = res.headers['set-cookie'];
    expect(cookies.some((c) => c.startsWith('token=;'))).toBe(true);
  });
});