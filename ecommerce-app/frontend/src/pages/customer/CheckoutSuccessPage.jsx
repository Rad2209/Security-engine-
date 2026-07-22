import { useLocation } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { formatCurrency } from '../../utils/formatCurrency';

function CheckoutSuccessPage() {
  const location = useLocation();
  // Passed via navigate(..., { state: { order } }) from CartPage. If this
  // page is reached directly (e.g. a refresh, or a bookmarked URL) rather
  // than via that navigation, state is simply absent — handled below with
  // a generic fallback rather than crashing on an undefined order.
  const order = location.state?.order;

  return (
    <div className="mx-auto max-w-lg px-6 py-20 text-center">
      <p className="font-mono text-xs uppercase tracking-wider text-brass-400">Order confirmed</p>
      <h1 className="mt-2 font-display text-2xl text-mist-100">Thank you</h1>

      {order ? (
        <div className="mt-8 rounded-sm border border-steel-500/40 bg-steel-800 p-6 text-left">
          <p className="font-mono text-xs text-steel-500">Order {order._id}</p>
          <ul className="mt-4 space-y-2">
            {order.items.map((item) => (
              <li key={item.productId} className="flex justify-between font-body text-sm text-mist-100/80">
                <span>Qty {item.quantity}</span>
                <span className="font-mono">{formatCurrency(item.priceAtPurchase * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-steel-500/30 pt-4">
            <p className="font-body text-sm text-mist-100/70">Total</p>
            <p className="font-mono text-lg text-brass-400">{formatCurrency(order.totalAmount)}</p>
          </div>
        </div>
      ) : (
        <p className="mt-4 font-body text-sm text-mist-100/60">
          Your order has been placed. View it in your order history.
        </p>
      )}

      <p className="mt-6 font-mono text-xs text-steel-500">
        This was a checkout simulation — no real payment was processed.
      </p>

      <div className="mt-8 flex justify-center gap-4">
        <Button to="/orders" variant="secondary">
          View orders
        </Button>
        <Button to="/shop">Continue shopping</Button>
      </div>
    </div>
  );
}

export default CheckoutSuccessPage;