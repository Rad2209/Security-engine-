import { Link } from 'react-router-dom';
import SpecBadge from '../layout/SpecBadge';
import { extractSpecs } from '../../utils/extractSpecs';
import { formatCurrency } from '../../utils/formatCurrency';

function ProductCard({ product }) {
  const specs = extractSpecs(product.description, 2);
  const image = product.images?.[0];

  return (
    <Link
      to={`/products/${product._id}`}
      className="group block overflow-hidden rounded-sm border border-steel-500/40 bg-steel-800 transition-colors hover:border-brass-400/50"
    >
      <div className="relative aspect-square overflow-hidden bg-ink-950">
        {image && (
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
        {specs.length > 0 && <SpecBadge className="absolute bottom-2 right-2">{specs.join(' · ')}</SpecBadge>}
      </div>
      <div className="p-4">
        <p className="font-body text-sm text-mist-100">{product.name}</p>
        <p className="mt-1 font-mono text-sm text-brass-400">{formatCurrency(product.price)}</p>
      </div>
    </Link>
  );
}

export default ProductCard;