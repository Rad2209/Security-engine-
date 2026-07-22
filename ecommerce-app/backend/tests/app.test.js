// Required env vars must be set BEFORE config/env.js is required anywhere
// in the require chain below (it validates and throws at load time).
process.env.MONGO_URI = 'mongodb://fake-host-for-tests/ecommerce';
process.env.JWT_SECRET = 'test-secret-not-for-production';
process.env.FRONTEND_URL = 'http://localhost:5173';

const request = require('supertest');
const createApp = require('../src/app');
const SecurityEngine = require('security-engine');

describe('App wiring — basic middleware chain', () => {
  test('the root path returns a simple status response', async () => {
    const allowAll = (req, res, next) => next();
    const app = createApp(allowAll);

    const res = await request(app).get('/');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ok');
  });

  test('a normal request reaches the route when security middleware allows it', async () => {
    const allowAll = (req, res, next) => next();
    const app = createApp(allowAll);

    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('a BLOCK verdict from the security middleware stops the request before any route runs', async () => {
    const blockAll = (req, res) => res.status(403).json({ success: false, error: { message: 'blocked' } });
    const app = createApp(blockAll);

    const res = await request(app).post('/api/auth/login').send({ email: 'a@b.com', password: 'whatever' });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test('CORS reflects FRONTEND_URL with credentials enabled (required for the httpOnly cookie)', async () => {
    const allowAll = (req, res, next) => next();
    const app = createApp(allowAll);

    const res = await request(app).get('/api/health').set('Origin', 'http://localhost:5173');

    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    expect(res.headers['access-control-allow-credentials']).toBe('true');
  });
});

describe('App wiring — the REAL Security Engine, with a fake in-memory adapter (no live DB needed)', () => {
  // These payloads target /api/auth/login, which the Security Engine blocks
  // before authController (and therefore before any User model / DB call)
  // ever runs — so no database mocking is needed for these specific tests.
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

  test('blocks a SQL injection payload in the login body before it reaches the controller', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: "' OR 1=1--", password: 'irrelevant' });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test('blocks an XSS payload in the login body before it reaches the controller', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'a@b.com', password: '<script>alert(1)</script>' });

    expect(res.status).toBe(403);
  });
});