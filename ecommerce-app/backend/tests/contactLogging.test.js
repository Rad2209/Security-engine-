process.env.MONGO_URI = 'mongodb://fake-host-for-tests/ecommerce';
process.env.JWT_SECRET = 'test-secret-not-for-production';
process.env.FRONTEND_URL = 'http://localhost:5173';

const request = require('supertest');
const createApp = require('../src/app');
const SecurityEngine = require('security-engine');

describe('Security Engine logging — contact endpoint', () => {
  test('saves an attack log entry when SQLi is detected in /api/contact', async () => {
    const recorded = [];

    const fakeAdapter = {
      isIpBlocked: async () => false,
      isAccountBlocked: async () => false,
      recordFailedAttempt: async () => {},
      countRecentAttempts: async () => ({ ipCount: 0, accountCount: 0 }),
      resetAttempts: async () => {},
      createBlock: async () => {},
      unblockIp: async () => {},
      saveAttackLog: async (entry) => recorded.push(entry),
      getLogs: async () => recorded,
    };

    const securityMiddleware = SecurityEngine.init({ storageAdapter: fakeAdapter });
    const app = createApp(securityMiddleware);

    const res = await request(app)
      .post('/api/contact')
      .send({ name: 'Evil', email: 'evil@example.com', message: "' OR 1=1--" });

    // Engine should block the request
    expect(res.status).toBe(403);

    // And record a log entry
    expect(recorded.length).toBeGreaterThan(0);
    expect(recorded[0].type).toBe('SQL_INJECTION');
    expect(recorded[0].endpoint).toBe('/api/contact');
  });

  test('saves an attack log entry when XSS is detected in /api/contact', async () => {
    const recorded = [];

    const fakeAdapter = {
      isIpBlocked: async () => false,
      isAccountBlocked: async () => false,
      recordFailedAttempt: async () => {},
      countRecentAttempts: async () => ({ ipCount: 0, accountCount: 0 }),
      resetAttempts: async () => {},
      createBlock: async () => {},
      unblockIp: async () => {},
      saveAttackLog: async (entry) => recorded.push(entry),
      getLogs: async () => recorded,
    };

    const securityMiddleware = SecurityEngine.init({ storageAdapter: fakeAdapter });
    const app = createApp(securityMiddleware);

    const res = await request(app)
      .post('/api/contact')
      .send({ name: 'Evil', email: 'evil@example.com', message: '<script>alert(1)</script>' });

    expect(res.status).toBe(403);
    expect(recorded.length).toBeGreaterThan(0);
    expect(recorded[0].type).toBe('XSS');
    expect(recorded[0].endpoint).toBe('/api/contact');
  });
});
