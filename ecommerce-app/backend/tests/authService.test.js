process.env.MONGO_URI = 'mongodb://fake-host-for-tests/ecommerce';
process.env.JWT_SECRET = 'test-secret-not-for-production';
process.env.FRONTEND_URL = 'http://localhost:5173';

jest.mock('../src/models', () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../src/models');
const authService = require('../src/services/authService');

describe('authService.register', () => {
  afterEach(() => jest.clearAllMocks());

  test('throws a 409 error if a user with that email already exists', async () => {
    User.findOne.mockResolvedValue({ _id: 'existing-id', email: 'a@b.com' });

    await expect(
      authService.register({ name: 'A', email: 'a@b.com', password: 'password123' })
    ).rejects.toMatchObject({ statusCode: 409 });

    expect(User.create).not.toHaveBeenCalled();
  });

  test('hashes the password (never stores it in plaintext) and creates the user', async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockImplementation(async (data) => ({ _id: 'new-id', ...data }));

    const user = await authService.register({
      name: 'Jane',
      email: 'jane@example.com',
      password: 'password123',
    });

    expect(User.create).toHaveBeenCalledTimes(1);
    const createArgs = User.create.mock.calls[0][0];
    expect(createArgs.passwordHash).toBeDefined();
    expect(createArgs.passwordHash).not.toBe('password123');
    expect(user.email).toBe('jane@example.com');
  });
});

describe('authService.validateCredentials', () => {
  afterEach(() => jest.clearAllMocks());

  test('returns null if no user is found for the email', async () => {
    User.findOne.mockResolvedValue(null);
    const result = await authService.validateCredentials({ email: 'nobody@example.com', password: 'x' });
    expect(result).toBeNull();
  });

  test('returns null if the password does not match (does not reveal which case it was)', async () => {
    const realHash = await bcrypt.hash('correct-password', 10);
    User.findOne.mockResolvedValue({ _id: '1', email: 'a@b.com', passwordHash: realHash });

    const result = await authService.validateCredentials({ email: 'a@b.com', password: 'wrong-password' });
    expect(result).toBeNull();
  });

  test('returns the user document if the password matches', async () => {
    const realHash = await bcrypt.hash('correct-password', 10);
    const fakeUser = { _id: '1', email: 'a@b.com', passwordHash: realHash };
    User.findOne.mockResolvedValue(fakeUser);

    const result = await authService.validateCredentials({ email: 'a@b.com', password: 'correct-password' });
    expect(result).toBe(fakeUser);
  });
});

describe('authService.signToken', () => {
  test('produces a valid JWT containing the user id (as sub) and role', () => {
    const token = authService.signToken({ _id: { toString: () => 'user-123' }, role: 'customer' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    expect(decoded.sub).toBe('user-123');
    expect(decoded.role).toBe('customer');
  });
});