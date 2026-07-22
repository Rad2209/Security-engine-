import { useState } from 'react';
import Button from '../ui/Button';

/**
 * @param {{ onSubmit: (input: { rating: number, comment: string }) => Promise<void> }} props
 */
function ReviewForm({ onSubmit }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await onSubmit({ rating, comment });
      setComment('');
      setRating(5);
    } catch (err) {
      // Note: if this rejects with a 403 (the Security Engine blocked the
      // request), err.response.data.error.message is still populated
      // ("Request blocked by Security Engine") since the engine's
      // ResponseHandler uses the same envelope shape as everything else —
      // no special-casing needed here.
      setError(err.response?.data?.error?.message || 'Could not submit review.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="review-rating" className="font-body text-sm text-mist-100/80">
          Rating
        </label>
        <select
          id="review-rating"
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="mt-1.5 block rounded-sm border border-steel-500/60 bg-steel-800 px-3 py-2 font-mono text-sm text-mist-100"
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} star{n > 1 ? 's' : ''}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="review-comment" className="font-body text-sm text-mist-100/80">
          Comment
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
          rows={3}
          maxLength={1000}
          placeholder="How's it held up?"
          className="mt-1.5 block w-full rounded-sm border border-steel-500/60 bg-steel-800 px-3 py-2 font-body text-sm text-mist-100 placeholder:text-mist-100/30 focus:border-brass-400"
        />
      </div>

      {error && <p className="font-mono text-xs text-tick-red">{error}</p>}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting…' : 'Submit review'}
      </Button>
    </form>
  );
}

export default ReviewForm;