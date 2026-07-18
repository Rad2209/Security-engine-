process.env.MONGO_URI = 'mongodb://fake-host-for-tests/ecommerce';
process.env.JWT_SECRET = 'test-secret-not-for-production';
process.env.FRONTEND_URL = 'http://localhost:5173';

jest.mock('../src/models', () => ({
  Product: {
    find: jest.fn(),
    countDocuments: jest.fn(),
    findById: jest.fn(),
  },
  Category: {
    findOne: jest.fn(),
  },
}));

const request = require('supertest');
const { Product } = require('../src/models');
const createApp = require('../src/app');

function chainableQuery(result) {
  const query = {
    populate: jest.fn(() => query),
    skip: jest.fn(() => query),
    limit: jest.fn(() => query),
    sort: jest.fn(() => query),
    then: (resolve) => resolve(result),
  };
  return query;
}

const allowAll = (req, res, next) => next();
const app = createApp(allowAll);

afterEach(() => jest.clearAllMocks());

describe('GET /api/products', () => {
  test('returns a paginated list', async () => {
    Product.find.mockReturnValue(chainableQuery([{ name: 'Laptop' }]));
    Product.countDocuments.mockResolvedValue(1);

    const res = await request(app).get('/api/products');

    expect(res.status).toBe(200);
    expect(res.body.data.items).toEqual([{ name: 'Laptop' }]);
    expect(res.body.data.pagination.total).toBe(1);
  });

  test('rejects an out-of-range limit at the validator layer', async () => {
    const res = await request(app).get('/api/products?limit=999');
    expect(res.status).toBe(422);
    expect(Product.find).not.toHaveBeenCalled();
  });
});

describe('GET /api/products/:id', () => {
  test('rejects a malformed id before reaching the service', async () => {
    const res = await request(app).get('/api/products/not-a-valid-id');
    expect(res.status).toBe(422);
    expect(Product.findById).not.toHaveBeenCalled();
  });

  test('returns 404 when the product does not exist', async () => {
    Product.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(null) });

    const res = await request(app).get('/api/products/507f1f77bcf86cd799439011');
    expect(res.status).toBe(404);
  });

  test('returns the product when found', async () => {
    Product.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue({ _id: '507f1f77bcf86cd799439011', name: 'Laptop' }),
    });

    const res = await request(app).get('/api/products/507f1f77bcf86cd799439011');
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Laptop');
  });
});