jest.mock('../src/models', () => ({
  Review: {
    find: jest.fn(),
    create: jest.fn(),
  },
  Product: {
    exists: jest.fn(),
  },
}));

const { Review, Product } = require('../src/models');
const reviewService = require('../src/services/reviewService');

describe('reviewService.listReviewsForProduct', () => {
  afterEach(() => jest.clearAllMocks());

  test('throws 404 if the product does not exist', async () => {
    Product.exists.mockResolvedValue(false);

    await expect(reviewService.listReviewsForProduct('missing-id')).rejects.toMatchObject({
      statusCode: 404,
    });
    expect(Review.find).not.toHaveBeenCalled();
  });

  test('returns reviews sorted newest-first when the product exists', async () => {
    Product.exists.mockResolvedValue(true);
    const sortMock = jest.fn().mockResolvedValue([{ comment: 'Great!' }]);
    const populateMock = jest.fn(() => ({ sort: sortMock }));
    Review.find.mockReturnValue({ populate: populateMock });

    const result = await reviewService.listReviewsForProduct('product-1');

    expect(Review.find).toHaveBeenCalledWith({ productId: 'product-1' });
    expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
    expect(result).toEqual([{ comment: 'Great!' }]);
  });
});

describe('reviewService.createReview', () => {
  afterEach(() => jest.clearAllMocks());

  test('throws 404 if the product does not exist, and never calls Review.create', async () => {
    Product.exists.mockResolvedValue(false);

    await expect(
      reviewService.createReview({ productId: 'missing', userId: 'u1', rating: 5, comment: 'Nice' })
    ).rejects.toMatchObject({ statusCode: 404 });

    expect(Review.create).not.toHaveBeenCalled();
  });

  test('creates the review when the product exists', async () => {
    Product.exists.mockResolvedValue(true);
    Review.create.mockResolvedValue({ _id: 'r1', comment: 'Nice product' });

    const result = await reviewService.createReview({
      productId: 'p1',
      userId: 'u1',
      rating: 4,
      comment: 'Nice product',
    });

    expect(Review.create).toHaveBeenCalledWith({
      productId: 'p1',
      userId: 'u1',
      rating: 4,
      comment: 'Nice product',
    });
    expect(result.comment).toBe('Nice product');
  });
});