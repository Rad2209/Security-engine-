process.env.MONGO_URI = 'mongodb://fake-host-for-tests/ecommerce';
process.env.JWT_SECRET = 'test-secret-not-for-production';
process.env.FRONTEND_URL = 'http://localhost:5173';

jest.mock('../src/models', () => ({
  Admin: {
    findOne: jest.fn(),
  },
}));

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Admin } = require('../src/models');
const adminAuthService = require('../src/services/adminAuthService');

describe('adminAuthService.validateAdminCredentials', () => {
  afterEach(() => jest.clearAllMocks());

  test('returns null if no admin is found', async () => {
    Admin.findOne.mockResolvedValue(null);
    const result = await adminAuthService.validateAdminCredentials({ email: 'nobody@x.com', password: 'x' });
    expect(result).toBeNull();
  });

  test('returns null on wrong password', async () => {
    const realHash = await bcrypt.hash('correct-password', 10);
    Admin.findOne.mockResolvedValue({ _id: '1', email: 'admin@x.com', passwordHash: realHash });

    const result = await adminAuthService.validateAdminCredentials({
      email: 'admin@x.com',
      password: 'wrong-password',
    });
    expect(result).toBeNull();
  });

  test('returns the admin document on correct credentials', async () => {
    const realHash = await bcrypt.hash('correct-password', 10);
    const fakeAdmin = { _id: '1', email: 'admin@x.com', passwordHash: realHash };
    Admin.findOne.mockResolvedValue(fakeAdmin);

    const result = await adminAuthService.validateAdminCredentials({
      email: 'admin@x.com',
      password: 'correct-password',
    });
    expect(result).toBe(fakeAdmin);
  });
});

describe('adminAuthService.signAdminToken', () => {
  test('produces a JWT with role "admin"', () => {
    const token = adminAuthService.signAdminToken({ _id: { toString: () => 'admin-1' }, role: 'admin' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded.sub).toBe('admin-1');
    expect(decoded.role).toBe('admin');
  });
});