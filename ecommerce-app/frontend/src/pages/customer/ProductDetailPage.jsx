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
          <img
            src="data:image/webp;base64,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"
            alt={product.name}
            className="h-full w-full object-cover"
          />
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