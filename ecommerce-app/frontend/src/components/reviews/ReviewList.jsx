function ReviewList({ reviews }) {
  if (!reviews || reviews.length === 0) {
    return <p className="font-body text-sm text-mist-100/50">No reviews yet — be the first.</p>;
  }

  return (
    <ul className="space-y-6">
      {reviews.map((review) => (
        <li key={review._id} className="border-b border-steel-500/30 pb-6">
          <div className="flex items-center justify-between">
            <p className="font-body text-sm font-medium text-mist-100">
              {review.userId?.name || 'Customer'}
            </p>
            <p className="font-mono text-xs text-brass-400">
              {'★'.repeat(review.rating)}
              {'☆'.repeat(5 - review.rating)}
            </p>
          </div>
          <p className="mt-2 font-body text-sm text-mist-100/70">{review.comment}</p>
        </li>
      ))}
    </ul>
  );
}

export default ReviewList;