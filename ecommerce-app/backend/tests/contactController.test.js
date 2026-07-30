process.env.MONGO_URI = 'mongodb://fake-host-for-tests/ecommerce';
process.env.JWT_SECRET = 'test-secret-not-for-production';
process.env.FRONTEND_URL = 'http://localhost:5173';
process.env.NODE_ENV = 'development';

jest.mock('../src/services/contactService', () => ({
  createContactMessage: jest.fn(),
  addSubscriber: jest.fn(),
}));

const request = require('supertest');
const createApp = require('../src/app');
const contactService = require('../src/services/contactService');

const allowAll = (req, res, next) => next();
const app = createApp(allowAll);

afterEach(() => jest.clearAllMocks());

describe('POST /api/contact', () => {
  test('creates a contact message and returns success for valid input', async () => {
    contactService.createContactMessage.mockResolvedValue({
      _id: 'contact-1',
      name: 'Alice',
      email: 'alice@example.com',
      message: 'Hello',
    });

    const res = await request(app)
      .post('/api/contact')
      .send({ name: 'Alice', email: 'alice@example.com', message: 'Hello' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({ name: 'Alice', email: 'alice@example.com', message: 'Hello' });
    expect(contactService.createContactMessage).toHaveBeenCalledTimes(1);
  });

  test('rejects invalid contact submission at the validator layer', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({ name: '', email: 'not-an-email', message: '' });

    expect(res.status).toBe(422);
    expect(contactService.createContactMessage).not.toHaveBeenCalled();
  });
});

describe('POST /api/contact/subscribe', () => {
  test('adds a subscriber and returns success for valid email', async () => {
    contactService.addSubscriber.mockResolvedValue({ _id: 'sub-1', email: 'bob@example.com' });

    const res = await request(app)
      .post('/api/contact/subscribe')
      .send({ email: 'bob@example.com' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual({ message: 'Subscribed successfully' });
    expect(contactService.addSubscriber).toHaveBeenCalledTimes(1);
  });

  test('rejects invalid subscribe request at the validator layer', async () => {
    const res = await request(app)
      .post('/api/contact/subscribe')
      .send({ email: 'not-an-email' });

    expect(res.status).toBe(422);
    expect(contactService.addSubscriber).not.toHaveBeenCalled();
  });
});
