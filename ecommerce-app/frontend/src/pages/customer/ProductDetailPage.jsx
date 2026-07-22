import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as productApi from '../../api/productApi';
import * as reviewApi from '../../api/reviewApi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import SpecBadge from '../../components/layout/SpecBadge';
import ReviewList from '../../components/reviews/ReviewList';
import ReviewForm from '../../components/reviews/ReviewForm';
import Button from '../../components/ui/Button';
import { extractSpecs } from '../../utils/extractSpecs';
import { formatCurrency } from '../../utils/formatCurrency';

function ProductDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [addStatus, setAddStatus] = useState('');
  const [notFound, setNotFound] = useState(false);

  const loadReviews = useCallback(() => {
    reviewApi
      .listReviews(id)
      .then(setReviews)
      .catch(() => setReviews([]));
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setNotFound(false);

    productApi
      .getProduct(id)
      .then((data) => {
        if (!cancelled) setProduct(data);
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    loadReviews();

    return () => {
      cancelled = true;
    };
  }, [id, loadReviews]);

  async function handleAddToCart() {
    setAddStatus('');
    try {
      await addItem(id, quantity);
      setAddStatus('Added to cart.');
    } catch (err) {
      setAddStatus(err.response?.data?.error?.message || 'Could not add to cart.');
    }
  }

  async function handleReviewSubmit({ rating, comment }) {
    await reviewApi.createReview(id, { rating, comment });
    loadReviews();
  }

  if (isLoading) {
    return (
      <p className="mx-auto max-w-6xl px-6 py-16 font-body text-sm text-mist-100/50">Loading…</p>
    );
  }

  if (notFound || !product) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-16 text-center">
        <p className="font-display text-xl text-mist-100">Product not found</p>
        <Link to="/shop" className="mt-4 inline-block text-sm text-mist-100/70 hover:text-mist-100">
          ← Back to shop
        </Link>
      </div>
    );
  }

  const specs = extractSpecs(product.description, 4);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="grid gap-10 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-sm border border-steel-500/40 bg-steel-800">
          {product.images?.[0] && (
            <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
          )}
        </div>

        <div>
          {product.categoryId?.name && (
            <p className="font-mono text-xs uppercase tracking-wider text-steel-500">
              {product.categoryId.name}
            </p>
          )}
          <h1 className="mt-2 font-display text-2xl text-mist-100">{product.name}</h1>
          <p className="mt-3 font-mono text-xl text-brass-400">{formatCurrency(product.price)}</p>

          {specs.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {specs.map((spec) => (
                <SpecBadge key={spec}>{spec}</SpecBadge>
              ))}
            </div>
          )}

          <p className="mt-6 font-body text-sm leading-relaxed text-mist-100/70">
            {product.description}
          </p>

          <div className="mt-8 flex items-center gap-3">
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              className="w-20 rounded-sm border border-steel-500/60 bg-steel-800 px-3 py-2 font-mono text-sm text-mist-100"
            />
            {user ? (
              <Button onClick={handleAddToCart}>Add to cart</Button>
            ) : (
              <Button to="/login" variant="secondary" state={{ from: { pathname: `/products/${id}` } }}>
                Log in to purchase
              </Button>
            )}
          </div>
          {addStatus && <p className="mt-3 font-mono text-xs text-mist-100/60">{addStatus}</p>}
        </div>
      </div>

      <div className="mt-16 border-t border-steel-500/30 pt-10">
        <h2 className="font-display text-lg text-mist-100">Field notes</h2>
        <div className="mt-6">
          <ReviewList reviews={reviews} />
        </div>

        <div className="mt-10 max-w-md">
          {user ? (
            <>
              <p className="mb-4 font-mono text-xs uppercase tracking-wider text-steel-500">
                Leave a review
              </p>
              <ReviewForm onSubmit={handleReviewSubmit} />
            </>
          ) : (
            <p className="font-body text-sm text-mist-100/60">
              <Link to="/login" className="text-brass-400 hover:underline">
                Log in
              </Link>{' '}
              to leave a review.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;