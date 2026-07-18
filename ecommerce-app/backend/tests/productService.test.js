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

const { Product, Category } = require('../src/models');
const productService = require('../src/services/productService');

/**
 * Builds a chainable fake query object matching the subset of Mongoose's
 * query builder API this service actually uses (populate/skip/limit/sort),
 * resolving to `result` when awaited.
 */
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

describe('productService.listProducts', () => {
  afterEach(() => jest.clearAllMocks());

  test('builds a plain string $regex filter from a normal search term', async () => {
    Product.find.mockReturnValue(chainableQuery([]));
    Product.countDocuments.mockResolvedValue(0);

    await productService.listProducts({ search: 'laptop' });

    expect(Product.find).toHaveBeenCalledWith({ name: { $regex: 'laptop', $options: 'i' } });
  });

  test('NoSQL-injection protection: coerces a query-operator OBJECT into a harmless string', async () => {
    Product.find.mockReturnValue(chainableQuery([]));
    Product.countDocuments.mockResolvedValue(0);

    // Simulates what Express's query parser produces for ?search[$ne]=null
    const maliciousSearch = { $ne: null };

    await productService.listProducts({ search: maliciousSearch });

    const filterUsed = Product.find.mock.calls[0][0];
    // Must NOT have passed the raw operator object through to Mongoose.
    expect(filterUsed.name.$regex).not.toEqual(maliciousSearch);
    expect(typeof filterUsed.name.$regex).toBe('string');
  });

  test('resolves a category slug to its ObjectId before filtering', async () => {
    const fakeCategoryId = 'category-object-id';
    Category.findOne.mockResolvedValue({ _id: fakeCategoryId, slug: 'electronics' });
    Product.find.mockReturnValue(chainableQuery([]));
    Product.countDocuments.mockResolvedValue(0);

    await productService.listProducts({ category: 'electronics' });

    expect(Category.findOne).toHaveBeenCalledWith({ slug: 'electronics' });
    expect(Product.find).toHaveBeenCalledWith(
      expect.objectContaining({ categoryId: fakeCategoryId })
    );
  });

  test('an unknown category slug results in an empty result set, not all products', async () => {
    Category.findOne.mockResolvedValue(null);
    Product.find.mockReturnValue(chainableQuery([]));
    Product.countDocuments.mockResolvedValue(0);

    await productService.listProducts({ category: 'does-not-exist' });

    const filterUsed = Product.find.mock.calls[0][0];
    // categoryId is some non-matching placeholder, not absent from the filter.
    expect(filterUsed.categoryId).toBeDefined();
  });

  test('computes pagination metadata correctly', async () => {
    Product.find.mockReturnValue(chainableQuery([]));
    Product.countDocuments.mockResolvedValue(25);

    const result = await productService.listProducts({ page: 2, limit: 10 });

    expect(result.pagination).toEqual({ page: 2, limit: 10, total: 25, totalPages: 3 });
  });
});

describe('productService.getProductById', () => {
  afterEach(() => jest.clearAllMocks());

  test('throws a 404 error when the product does not exist', async () => {
    Product.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(null) });

    await expect(productService.getProductById('does-not-exist')).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  test('returns the populated product when found', async () => {
    const fakeProduct = { _id: '1', name: 'Laptop' };
    Product.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(fakeProduct) });

    const result = await productService.getProductById('1');
    expect(result).toBe(fakeProduct);
  });
});