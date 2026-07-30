process.env.MONGO_URI = 'mongodb://fake-host-for-tests/ecommerce';
process.env.JWT_SECRET = 'test-secret-not-for-production';
process.env.FRONTEND_URL = 'http://localhost:5173';

jest.mock('../src/services/contactService', () => ({
  createContactMessage: jest.fn(),
  addSubscriber: jest.fn(),
}));

const request = require('supertest');
const createApp = require('../src/app');
const SecurityEngine = require('security-engine');
const contactService = require('../src/services/contactService');

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

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Real Security Engine — contact endpoints', () => {
  test('blocks SQL injection in contact message payload before the controller runs', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({ name: 'Alice', email: 'alice@example.com', message: "' OR 1=1--" });

    expect(res.status).toBe(403);
    expect(contactService.createContactMessage).not.toHaveBeenCalled();
  });

  test('blocks XSS in contact message payload before the controller runs', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({ name: 'Alice', email: 'alice@example.com', message: '<script>alert(1)</script>' });

    expect(res.status).toBe(403);
    expect(contactService.createContactMessage).not.toHaveBeenCalled();
  });

  test('blocks SQL injection in subscribe payload before the controller runs', async () => {
    const res = await request(app)
      .post('/api/contact/subscribe')
      .send({ email: "' OR 1=1--@example.com" });

    expect(res.status).toBe(403);
    expect(contactService.addSubscriber).not.toHaveBeenCalled();
  });

  test('blocks XSS in subscribe payload before the controller runs', async () => {
    const res = await request(app)
      .post('/api/contact/subscribe')
      .send({ email: 'foo@example.com<script>alert(1)</script>' });

    expect(res.status).toBe(403);
    expect(contactService.addSubscriber).not.toHaveBeenCalled();
  });

  test('allows a clean contact submission through to the controller', async () => {
    contactService.createContactMessage.mockResolvedValue({ _id: 'msg-1', name: 'Alice', email: 'alice@example.com', message: 'Hello' });

    const res = await request(app)
      .post('/api/contact')
      .send({ name: 'Alice', email: 'alice@example.com', message: 'Hello there!' });

    expect(res.status).toBe(200);
    expect(contactService.createContactMessage).toHaveBeenCalledTimes(1);
  });

  test('allows a clean subscribe request through to the controller', async () => {
    contactService.addSubscriber.mockResolvedValue({ _id: 'sub-1', email: 'bob@example.com' });

    const res = await request(app)
      .post('/api/contact/subscribe')
      .send({ email: 'bob@example.com' });

    expect(res.status).toBe(200);
    expect(contactService.addSubscriber).toHaveBeenCalledTimes(1);
  });
});
