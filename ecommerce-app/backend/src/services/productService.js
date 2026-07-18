const { Product, Category } = require('../models');

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;

/**
 * productService
 *
 * Plain Mongoose querying — this is NOT where SQL/NoSQL attack protection
 * lives; that's the Security Engine's job, upstream of this service ever
 * running. The one exception is the explicit String(...) coercion below,
 * which guards against a DIFFERENT vector than SQL injection: Express's
 * query-string parser can turn `?search[$ne]=null` into
 * `req.query.search = { $ne: null }` — an object, not a string. If that
 * object reached Mongoose's filter unmodified, it would be interpreted as a
 * MongoDB query operator instead of a search term (NoSQL operator
 * injection). Coercing to a string neutralizes it regardless of the
 * input's shape.
 */
async function listProducts({ search, category, page = DEFAULT_PAGE, limit = DEFAULT_LIMIT } = {}) {
  const filter = {};

  if (search) {
    filter.name = { $regex: String(search), $options: 'i' };
  }

  if (category) {
    const categoryDoc = await Category.findOne({ slug: String(category) });
    // An unknown category slug should return an empty result set, not every
    // product — using a nonexistent ObjectId keeps the query shape uniform
    // rather than branching into a separate "return nothing" code path.
    filter.categoryId = categoryDoc ? categoryDoc._id : '000000000000000000000000';
  }

  const pageNum = Number(page) || DEFAULT_PAGE;
  const limitNum = Number(limit) || DEFAULT_LIMIT;
  const skip = (pageNum - 1) * limitNum;

  const [items, total] = await Promise.all([
    Product.find(filter).populate('categoryId').skip(skip).limit(limitNum).sort({ createdAt: -1 }),
    Product.countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 0,
    },
  };
}

async function getProductById(id) {
  const product = await Product.findById(id).populate('categoryId');

  if (!product) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }

  return product;
}
/**
 * Admin-facing listing: full, unpaginated view of every product. Separate
 * from listProducts() (customer-facing, paginated, search/category
 * filterable) — the admin dashboard's "view products" screen wants
 * everything at once, not a search experience.
 */
async function listAllProductsForAdmin() {
  return Product.find().populate('categoryId').sort({ createdAt: -1 });
}

module.exports = { listProducts, getProductById, listAllProductsForAdmin };
