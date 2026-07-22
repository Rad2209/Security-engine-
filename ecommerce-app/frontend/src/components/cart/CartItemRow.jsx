import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatCurrency';

/**
 * @param {{ item: { productId: object, quantity: number }, onUpdateQuantity: Function, onRemove: Function }} props
 */
function CartItemRow({ item, onUpdateQuantity, onRemove }) {
  const product = item.productId;

  // Defensive: a product could theoretically be deleted after being added
  // to someone's cart. The backend's checkout() already guards against
  // this server-side (throws 400 "products no longer exist"); this just
  // keeps the cart page from crashing if it ever renders such a state.
  if (!product) return null;

  const lineTotal = product.price * item.quantity;

  return (
    <div className="flex items-center gap-4 border-b border-steel-500/30 py-5">
      <Link
        to={`/products/${product._id}`}
        className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-sm border border-steel-500/40 bg-ink-950"
      >
        {product.images?.[0] && (
          <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
        )}
      </Link>

      <div className="flex-1">
        <Link to={`/products/${product._id}`} className="font-body text-sm text-mist-100 hover:text-brass-400">
          {product.name}
        </Link>
        <p className="mt-1 font-mono text-xs text-mist-100/50">{formatCurrency(product.price)} each</p>
      </div>

      <input
        type="number"
        min="1"
        value={item.quantity}
        onChange={(e) => onUpdateQuantity(product._id, Math.max(1, Number(e.target.value)))}
        className="w-16 rounded-sm border border-steel-500/60 bg-steel-800 px-2 py-1.5 text-center font-mono text-sm text-mist-100"
      />

      <p className="w-20 text-right font-mono text-sm text-brass-400">{formatCurrency(lineTotal)}</p>

      <button
        type="button"
        onClick={() => onRemove(product._id)}
        className="font-mono text-xs text-mist-100/40 transition-colors hover:text-tick-red"
      >
        Remove
      </button>
    </div>
  );
}

export default CartItemRow;